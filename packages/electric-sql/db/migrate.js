const { DATABASE_URL, PUBLIC_DATABASE_URL } = require(`./util.js`)
const { spawnSync } = require(`child_process`)
const process = require(`process`)

console.info(`Connecting to postgres at ${PUBLIC_DATABASE_URL}`)

const args = [
  `exec`,
  // `-s`,
  `pg-migrations`,
  `apply`,
  `--database`,
  DATABASE_URL,
  `--directory`,
  `./db/migrations`,
]
console.log({ args })
const res = spawnSync(`pnpm`, args, { cwd: __dirname })

let newMigrationsApplied = true

console.log(res)
console.log(res.output.toString())

// proc.on(`exit`, (code) => {
// console.log(code)
// if (code === 0) {
// if (newMigrationsApplied) {
// console.log(`⚡️ Database migrated.`)
// } else {
// console.log(`⚡ Database already up to date.`)
// }
// }
// })
