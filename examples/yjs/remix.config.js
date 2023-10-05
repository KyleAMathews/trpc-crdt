/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    v2_routeConvention: true,
  },
  tailwind: true,
  postcss: true,
  ignoredRouteFiles: [`**/.*`],
  serverBuildDirectory: `server/build`,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
}
