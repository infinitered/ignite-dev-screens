const sourceFolder = `${process.cwd()}/node_modules/ignite-dev-screens/templates`

const add = async function (context) {
  const { patching, filesystem, print, ignite } = context

  const MANUAL_INSTALL_INFO = `
  ✨ DevScreens installed!

  We couldn't automatically add them to your project. But it's pretty easy!
  Just add the following to your primary screen or navigation:

  ${print.colors.bold('import DevscreensButton from \'../../ignite/DevScreens/DevscreensButton.js\'')}

  ${print.colors.muted('// In your view JSX somewhere...')}

  <DevscreensButton />
  `
  // Set Examples to "classic" in Ignite config
  ignite.setIgniteConfig('examples', 'classic')

  // Set Android Permission for NetInfo module
  ignite.addAndroidPermission('ACCESS_NETWORK_STATE')

  // dev screens use react-navigation
  await ignite.addModule('react-navigation', { version: '1.0.0-beta.11' })

  // react-native-device-info
  await ignite.addModule('react-native-device-info', { link: true, version: '0.11.0' })

  // add prop types
  await ignite.addModule('prop-types', { version: '15.6.0' })

  // Copy the the screens to containers folder
  await filesystem.copyAsync(`${sourceFolder}`, `${process.cwd()}/ignite/DevScreens`, { overwrite: true })

  // Set showDevScreens to __DEV__
  ignite.setDebugConfig('showDevScreens', '__DEV__', true)

  // Insert a function that renders the dev screens as part of the JSX in the navigation
  const launchScreen = `${process.cwd()}/App/Containers/LaunchScreen.js`
  if (filesystem.exists(launchScreen)) {
    if (!patching.isInFile(launchScreen, 'import DevscreensButton')) {
      patching.insertInFile(launchScreen, 'from \'react-native\'', 'import DevscreensButton from \'../../ignite/DevScreens/DevscreensButton.js\'\n')
    }
    if (!patching.isInFile(launchScreen, '<DevscreensButton />')) {
      patching.insertInFile(launchScreen, '</ScrollView>', '          <DevscreensButton />', false)
    }
  } else {
    print.info(MANUAL_INSTALL_INFO)
  }

  // Call the function in the navigation, which adds/provides the dev screens
  // TODO: Use navigation generator to add screens
}

const remove = async function (context) {
  const { filesystem, ignite, patching } = context

  console.log('Removing Ignite Dev Screens')

  // Set Examples to "false" in Ignite config
  ignite.removeIgniteConfig('examples')

  await ignite.removeModule('react-native-device-info', { unlink: true })
  // remove the npm module - probably should ask user here
  await ignite.removeModule('react-navigation')

  // Set Android Permission for NetInfo module
  // NOTE(steve): this is too presumptious
  ignite.removeAndroidPermission('ACCESS_NETWORK_STATE')

  // Delete screens from containers folder
  filesystem.remove('ignite/DevScreens')

  // Remove App/Config/DebugSettings.js showDevScreens value
  ignite.removeDebugConfig('showDevScreens')

  // Remove function and call from navigation
  // TODO: Use navigation generator to remove screens

  // Remove dev screens button from launch page, if launch page is found
  const launchScreen = `${process.cwd()}/App/Containers/LaunchScreen.js`
  if (filesystem.exists(launchScreen)) {
    patching.replaceInFile(launchScreen, 'import DevscreensButton', '')
    patching.replaceInFile(launchScreen, '<DevscreensButton />', '')
  }
}

module.exports = { add, remove }
