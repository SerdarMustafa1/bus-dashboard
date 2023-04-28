const roles = [0, 1, 3, 5];
// 0: "Installer",
// 1: 'Install lead',
// 3: 'Sales',
// 5: 'Admin',
// 11: 'Super Admin',

const badgeColors = {
  0: 'primary',
  1: 'success',
  3: 'warning',
  5: 'danger',
  11: 'danger',
};

const roleTranslate = (rolenr, t) => {
  return roles.includes(rolenr) ? t('user.role.' + rolenr) : t('user.role.-');
};

const getBadgeColor = (rolenr) => {
  return rolenr in badgeColors ? badgeColors[rolenr] : 'secondary';
};

export { roles, roleTranslate, getBadgeColor };
