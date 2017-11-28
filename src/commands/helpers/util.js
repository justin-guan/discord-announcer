/**
 * getName - Get either the nickname of username of the member
 *
 * @param {Member} member A Discord.js Member object
 * @return {String} The nickname of the member, otherwise their username
 */
function getName(member) {
  return member.nickname ? member.nickname : member.user.username;
}

exports.getName = getName;
