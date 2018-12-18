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

  // Patch for animatable
  const pluginExamplesScreen = `${process.cwd()}/ignite/DevScreens/PluginExamplesScreen.js`
  try {
    const animatableExample = `${process.cwd()}/node_modules/ignite-animatable`
    if (!filesystem.exists(animatableExample)) {
      ignite.patchInFile(pluginExamplesScreen, {
        replace: 'import \'../Examples/Components/animatableExample.js\'',
        insert: '// animatableExample removed - ignite-animatable not installed [DO NOT REMOVE THIS LINE!]'
      })
    } else {
      ignite.patchInFile(pluginExamplesScreen, {
        replace: '// animatableExample removed - ignite-animatable not installed',
        insert: 'import \'../Examples/Components/animatableExample.js\''
      })
    }
  } catch(e) {
    print.info(`Something went wrong patching out missing ignite-animatable - ${e}`)
  }
  
  try {
    // Patch for vector-icons
    const vectorExample = `${process.cwd()}/node_modules/ignite-vector-icons`
    if (!filesystem.exists(vectorExample)) {
      ignite.patchInFile(pluginExamplesScreen, {
        replace: 'import \'../Examples/Components/vectorExample.js\'',
        insert: '// vectorExample removed - ignite-vector-icons not installed [DO NOT REMOVE THIS LINE!]'
      })
    } else {
      ignite.patchInFile(pluginExamplesScreen, {
        replace: '// vectorExample removed - ignite-vector-icons not installed',
        insert: 'import \'../Examples/Components/vectorExample.js\''
      })
    }
  } catch(e) {
    print.info(`Something went wrong patching out missing ignite-vector-icons - ${e}`)
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
