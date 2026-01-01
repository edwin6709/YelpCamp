module.exports = func => {
  return(req, res, next) => { // return a function that
// accepts a function then executes it and catches an error and passes it to next
    func(req, res, next).catch(next);
  }
}
