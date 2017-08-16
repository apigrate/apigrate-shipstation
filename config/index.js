module.exports = function(env){
  return require('./' + (env || process.env.NODE_ENV || 'development') + '.json');
}
