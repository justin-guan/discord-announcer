/**
 * getName - Get either the nickname of username of the member
 *
 * @param {Member} member A Discord.js Member object
 * @return {String} The nickname of the member, otherwise their username
 */
function getName(member) {
  return member.nickname ? member.nickname : member.user.username;
}

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

/**
 * random - Generates a random number between min and max
 *
 * @param  {Number} min Lower bound for random number generation
 * @param  {Number} max Upper bound for random number generation
 * @return {Number}     A random number generated between the bounds
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

exports.getName = getName;
exports.isAdmin = isAdmin;
exports.random = random;
