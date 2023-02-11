// utility function to catch errors specifically in async functions so that it can be passed on to "next" 

module.exports = func => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};