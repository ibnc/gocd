/*
 * Copyright 2019 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.thoughtworks.go.apiv2.configrepos;

import com.thoughtworks.go.api.ApiController;
import com.thoughtworks.go.api.ApiVersion;
import com.thoughtworks.go.api.representers.JsonReader;
import com.thoughtworks.go.api.spring.ApiAuthenticationHelper;
import com.thoughtworks.go.api.util.GsonTransformer;
import com.thoughtworks.go.api.util.MessageJson;
import com.thoughtworks.go.apiv2.configrepos.representers.ConfigRepoConfigRepresenterV2;
import com.thoughtworks.go.apiv2.configrepos.representers.ConfigRepoWithResultListRepresenter;
import com.thoughtworks.go.apiv2.configrepos.representers.ConfigRepoWithResultRepresenter;
import com.thoughtworks.go.config.GoRepoConfigDataSource;
import com.thoughtworks.go.config.PartialConfigParseResult;
import com.thoughtworks.go.config.exceptions.EntityType;
import com.thoughtworks.go.config.exceptions.HttpException;
import com.thoughtworks.go.config.exceptions.RecordNotFoundException;
import com.thoughtworks.go.config.materials.SubprocessExecutionContext;
import com.thoughtworks.go.config.remote.ConfigRepoConfig;
import com.thoughtworks.go.domain.materials.Material;
import com.thoughtworks.go.domain.materials.MaterialConfig;
import com.thoughtworks.go.domain.materials.Modification;
import com.thoughtworks.go.server.materials.MaterialUpdateService;
import com.thoughtworks.go.server.persistence.MaterialRepository;
import com.thoughtworks.go.server.service.ConfigRepoService;
import com.thoughtworks.go.server.service.MaterialConfigConverter;
import com.thoughtworks.go.server.service.MaterialService;
import com.thoughtworks.go.spark.Routes.ConfigRepos;
import com.thoughtworks.go.spark.spring.SparkSpringController;
import com.thoughtworks.go.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import spark.Request;
import spark.Response;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import static com.thoughtworks.go.util.CachedDigestUtils.sha256Hex;
import static spark.Spark.*;

@Component
public class ConfigReposInternalControllerV2 extends ApiController implements SparkSpringController {

    private final ConfigRepoService service;
    private final GoRepoConfigDataSource dataSource;
    private final ApiAuthenticationHelper authHelper;
    private final MaterialUpdateService mus;
    private final MaterialConfigConverter converter;
    private final MaterialRepository materialRepository;
    private final MaterialService materialService;
    private final SubprocessExecutionContext subprocessExecutionContext;

    @Autowired
    public ConfigReposInternalControllerV2(ApiAuthenticationHelper authHelper, ConfigRepoService service, GoRepoConfigDataSource dataSource, MaterialUpdateService mus, MaterialConfigConverter converter, MaterialRepository materialRepository, MaterialService materialService, SubprocessExecutionContext subprocessExecutionContext) {
        super(ApiVersion.v2);
        this.service = service;
        this.dataSource = dataSource;
        this.authHelper = authHelper;
        this.mus = mus;
        this.converter = converter;
        this.materialRepository = materialRepository;
        this.materialService = materialService;
        this.subprocessExecutionContext = subprocessExecutionContext;
    }

    @Override
    public String controllerBasePath() {
        return ConfigRepos.INTERNAL_BASE;
    }

    @Override
    public void setupRoutes() {
        path(controllerBasePath(), () -> {
            before("", mimeType, this::setContentType);
            before("", mimeType, authHelper::checkAdminUserAnd403);
            before("", mimeType, this::verifyContentType);

            before("/*", mimeType, this::setContentType);
            before("/*", mimeType, authHelper::checkAdminUserAnd403);
            before("/*", mimeType, this::verifyContentType);

            get(ConfigRepos.INDEX_PATH, mimeType, this::listRepos);
            get(ConfigRepos.REPO_PATH, mimeType, this::showRepo);
            get(ConfigRepos.STATUS_PATH, mimeType, this::inProgress);
            post(ConfigRepos.DRY_RUN, mimeType, this::dryRun);
            post(ConfigRepos.TRIGGER_UPDATE_PATH, mimeType, this::triggerUpdate);
            exception(HttpException.class, this::httpException);
        });
    }

    String listRepos(Request req, Response res) throws IOException {
        List<ConfigRepoWithResult> repos = allRepos();

        final String etag = etagFor(repos);

        setEtagHeader(res, etag);

        if (fresh(req, etag)) {
            return notModified(res);
        }

        return writerForTopLevelObject(req, res, w -> ConfigRepoWithResultListRepresenter.toJSON(w, repos));
    }

    String showRepo(Request req, Response res) throws IOException {
        ConfigRepoWithResult repo = repoWithResultFromRequest(req);

        final String etag = etagFor(repo);

        setEtagHeader(res, etag);

        if (fresh(req, etag)) {
            return notModified(res);
        }

        return writerForTopLevelObject(req, res, w -> ConfigRepoWithResultRepresenter.toJSON(w, repo));
    }

    String dryRun(Request req, Response res) {
        File folder = FileUtil.createTempFolder();
        String responseText;
        try {
            JsonReader jsonReader = GsonTransformer.getInstance().jsonReaderFrom(req.body());
            ConfigRepoConfig repoConfig = ConfigRepoConfigRepresenterV2.fromJSON(jsonReader);
            repoConfig.setPluginId("yaml.config.plugin");
            if (service.hasConfigRepo(repoConfig)) {
                responseText = new ConfigRepoDryRunResult("UnPACable :( - The provided Material is already being used to create Pipelines with code", false).toJSON();
            } else {
                Material material = converter.toMaterial(repoConfig.getMaterialConfig());
                List<Modification> modifications = materialService.latestModification(material, folder, subprocessExecutionContext);
                materialService.checkout(material, folder, Modification.latestRevision(modifications), subprocessExecutionContext);
                if (dataSource.dryRun(repoConfig, folder)) {
                    responseText = new ConfigRepoDryRunResult("PACable! - Config file(s) present", true).toJSON();
                } else {
                    responseText = new ConfigRepoDryRunResult("UnPACable :( - There are no config files present or they are not parsable", false).toJSON();
                }
            }
        } catch (Exception ex) {
            res.status(500);
            responseText = MessageJson.create(ex.getMessage());
        } finally {
            FileUtils.deleteQuietly(folder);
        }

        return responseText;
    }

    String triggerUpdate(Request req, Response res) {
        MaterialConfig materialConfig = repoFromRequest(req).getMaterialConfig();
        if (mus.updateMaterial(converter.toMaterial(materialConfig))) {
            res.status(HttpStatus.CREATED.value());
            return MessageJson.create("OK");
        } else {
            res.status(HttpStatus.CONFLICT.value());
            return MessageJson.create("Update already in progress.");
        }
    }

    String inProgress(Request req, Response res) {
        MaterialConfig materialConfig = repoFromRequest(req).getMaterialConfig();
        final boolean state = mus.isInProgress(converter.toMaterial(materialConfig));
        return String.format("{\"inProgress\":%b}", state);
    }

    private String etagFor(Object entity) {
        return sha256Hex(Integer.toString(entity.hashCode()));
    }

    private ConfigRepoWithResult repoWithResultFromRequest(Request req) {
        String repoId = req.params(":id");
        ConfigRepoConfig repo = service.getConfigRepo(repoId);

        if (null == repo) {
            throw new RecordNotFoundException(EntityType.ConfigRepo, repoId);
        }

        PartialConfigParseResult result = dataSource.getLastParseResult(repo.getMaterialConfig());

        return new ConfigRepoWithResult(repo, result, isMaterialUpdateInProgress(repo));
    }

    private ConfigRepoConfig repoFromRequest(Request req) {
        String repoId = req.params(":id");
        ConfigRepoConfig repo = service.getConfigRepo(repoId);

        if (null == repo) {
            throw new RecordNotFoundException(EntityType.ConfigRepo, repoId);
        }

        return repo;
    }

    private List<ConfigRepoWithResult> allRepos() {
        return service.getConfigRepos().stream().map(r -> {
            PartialConfigParseResult result = dataSource.getLastParseResult(r.getMaterialConfig());
            return new ConfigRepoWithResult(r, result, isMaterialUpdateInProgress(r));
        }).collect(Collectors.toList());
    }

    private boolean isMaterialUpdateInProgress(ConfigRepoConfig configRepoConfig) {
        return mus.isInProgress(converter.toMaterial(configRepoConfig.getMaterialConfig()));
    }
}
