export const hasAdminRole = authInfo => {
  return authInfo?.roles?.includes('nd.metadata_admin');
}

export const hasEditorRole = authInfo => {
  return authInfo?.roles?.includes('nd.geolett');
}

export const isResponsibleAgency = (authInfo = {}, responsibleAgency = {}) => {
  return parseInt(authInfo.organizationNumber) === responsibleAgency.orgNumber;
}

export const isOwner = (authInfo = {}, owner = {}) => {
  return parseInt(authInfo.organizationNumber) === owner.orgNumber;
}


// RegisterItem
export const canAddRegisterItem = authInfo => {
  return hasAdminRole(authInfo) || hasEditorRole(authInfo);
}

export const canDeleteRegisterItem = (authInfo, owner) => {

  return canEditRegisterItem(authInfo, owner);
}

export const canEditRegisterItem = (authInfo, owner) => {
  if (hasAdminRole(authInfo)) {
    return true;
  } else if (hasEditorRole(authInfo)) {
    return isOwner(authInfo, owner);
  } else {
    return false;
  }
}

export const canEditRegisterItemOwner = authInfo => {
  return hasAdminRole(authInfo);
}
