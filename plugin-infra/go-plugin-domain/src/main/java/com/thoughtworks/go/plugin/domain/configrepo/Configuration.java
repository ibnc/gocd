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

package com.thoughtworks.go.plugin.domain.configrepo;

import java.util.List;

public class Configuration {
    private List<ConfigurationProperty> requiredProperties;
    private List<ConfigurationProperty> optionalProperties;


    public Configuration(List<ConfigurationProperty> requiredProperties, List<ConfigurationProperty> optionalProperties) {
        this.requiredProperties = requiredProperties;
        this.optionalProperties = optionalProperties;
    }

    public List<ConfigurationProperty> getRequiredProperties() {
        return requiredProperties;
    }

    public void setRequiredProperties(List<ConfigurationProperty> properties) {
        this.requiredProperties = properties;
    }

    public List<ConfigurationProperty> getOptionalProperties() {
        return optionalProperties;
    }

    public void setOptionalProperties(List<ConfigurationProperty> optionalProperties) {
        this.optionalProperties = optionalProperties;
    }
}
