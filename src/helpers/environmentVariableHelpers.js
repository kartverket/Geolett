// Config
import { config } from 'components/config';

const insertEnvironmentVariableParameters = (environmentVariable, environmentVariableParameters) => {
  const environmentVariableRegex = /{[0-9a-z]*}/ig;
  let m;
  const environmentVariableCopy = environmentVariable;
  while ((m = environmentVariableRegex.exec(environmentVariableCopy)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === environmentVariableRegex.lastIndex) {
      environmentVariableRegex.lastIndex++;
    }
    const match = m[0];
    const index = match.substring(match.lastIndexOf("{") + 1, match.lastIndexOf("}"));
    environmentVariable = environmentVariable.replace(match, environmentVariableParameters[index])
  };
  return environmentVariable;
}

const findNestedPropertyInConfig = (environmentVariables, environmentVariableKeyArray, arrayIndex = 0) => {
  const environmentVariableKey = environmentVariableKeyArray[arrayIndex];
  const nestedPropertyInConfig = environmentVariables[environmentVariableKey];
  arrayIndex++
  if (arrayIndex < environmentVariableKeyArray.length) {
    const environmentVariable = environmentVariables[environmentVariableKey];
    return findNestedPropertyInConfig(environmentVariable, environmentVariableKeyArray, arrayIndex);
  } else {
    return nestedPropertyInConfig;
  }
}

export const getEnvironmentVariable = (environmentVariableKey, environmentVariableParameters = {}) => {
  const environmentVariables = config;
  const environmentVariableKeyArray = environmentVariableKey.split('.');
  if (environmentVariables && environmentVariableKeyArray.length) {
    const environmentVariable = findNestedPropertyInConfig(environmentVariables, environmentVariableKeyArray);
    return insertEnvironmentVariableParameters(environmentVariable, environmentVariableParameters);
  } else {
    console.warn(`Environment variable for ${environmentVariableKey} is missing`);
    return null;
  }
}
