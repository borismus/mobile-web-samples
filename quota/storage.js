/**
 * Allocates a file of given size (in bytes) of local storage data.
 */
function makeString(size) {
  var buffer = '';
  for (var i = 0; i < size/2; i++) {
    var index = parseInt(Math.random() * 26);
    buffer += 'abcdefghijklmnopqrstuvwxyz'[index];
  }
  return buffer;
}

function megaBytesInBytes(mb) {
  return mb * 1024 * 1024;
}

function allocateMB(key, mb) {
  var s = makeString(megaBytesInBytes(mb));
  localStorage.setItem(key, s);

  console.log('allocated ', mb, 'mb');
}
