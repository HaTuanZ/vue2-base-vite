import { Route } from '../ARoute'

export default Route.withPageLayout('/').addChildren([
  Route.withPath('', 'landingPage/landingPage').withName('landingPage'),
])
