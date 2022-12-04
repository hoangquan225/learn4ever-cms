const something = require.context("./", true, /route.tsx$/);
const routes = something.keys().map((path) => {
  return require(`${path}`).default;
});

export default routes;
