/**
 * _isAdmin - Check if a member is an Admin
 *
 * @param  {Member} member A Discord.js Guild Member object
 * @param {Guild} guild A Discord.js Guild object
 * @return {Boolean}    True if Admin, false otherwise
 */
function isAdmin(member, guild) {
  const adminRole = guild.roles.find('name', 'Admin');
  return member.roles.has(adminRole.id);
}

exports.isAdmin = isAdmin;
