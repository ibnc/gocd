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

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ConfigRepoDryRunResult {
    private String message;
    private Boolean valid;
    private List<String> pacAblePlugins;

    public ConfigRepoDryRunResult(String message, Boolean valid, List<String> pacAblePlugins) {
       this.message = message;
       this.valid = valid;
        this.pacAblePlugins = pacAblePlugins;
    }

    public static ConfigRepoDryRunResult success(String message, List<String> pacAblePlugins) {
       return new ConfigRepoDryRunResult(message, true, pacAblePlugins);
    }

    public static ConfigRepoDryRunResult failure(String message) {
        return new ConfigRepoDryRunResult(message, false, Collections.emptyList());
    }

    public String toJSON() {
        String plugins = getPacAblePlugins().stream().map(p -> String.format("\"%s\"", p)).collect(Collectors.joining(", "));

        return String.format("{\"message\": \"%s\", \"plugins\": [%s], \"valid\": %b}", getMessage(), plugins, getValid());
    }

    public String getMessage() {
        return message;
    }

    public Boolean getValid() {
        return valid;
    }

    public List<String> getPacAblePlugins() {
        return pacAblePlugins;
    }
}
