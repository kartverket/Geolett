export const hasAdminRole = authInfo => {
  return authInfo && authInfo.roles && authInfo.roles.includes('nd.metadata_admin');
}

export const hasEditorRole = authInfo => {
  return authInfo && authInfo.roles && authInfo.roles.includes('nd.geolett');
}

export const isResponsibleAgency = (authInfo = {}, responsibleAgency = {}) => {
  return parseInt(authInfo.organizationNumber) === responsibleAgency.orgNumber;
}

export const isOwner = (authInfo = {}, owner = {}) => {
  return parseInt(authInfo.organizationNumber) === owner.orgNumber;
}


// RegisterItem
export const canAddRegisterItem = authInfo => {
  return hasAdminRole(authInfo);
}

export const canDeleteRegisterItem = authInfo => {
  return hasAdminRole(authInfo);
}

export const canEditRegisterItem = authInfo => {
  return hasAdminRole(authInfo);
}

export const canEditRegisterItemOwner = authInfo => {
  return hasAdminRole(authInfo);
}
