const test = require('ava')
const sinon = require('sinon')
const plugin = require('../plugin')
const sourceFolder = `${process.cwd()}/node_modules/ignite-dev-screens/templates`
const launchScreen = `${process.cwd()}/App/Containers/LaunchScreen.js`

// ignite
const addModule = sinon.spy()
const addPluginComponentExample = sinon.spy()
const setIgniteConfig = sinon.spy()
const addAndroidPermission = sinon.spy()
const setDebugConfig = sinon.spy()
// filesystem
const copyAsync = sinon.spy()
const defaultExists = sinon.spy()
// patching
const defaultIsInFile = sinon.spy()
const insertInFile = sinon.spy()
// print
const info = sinon.spy()
const bold = sinon.spy()
const muted = sinon.spy()

const defaultContext = {
  ignite: {
    addModule: addModule,
    addPluginComponentExample: addPluginComponentExample,
    setIgniteConfig: setIgniteConfig,
    addAndroidPermission: addAndroidPermission,
    setDebugConfig: setDebugConfig
  },
  filesystem: {
    copyAsync: copyAsync,
    exists: defaultExists
  },
  patching: {
    isInFile: defaultIsInFile,
    insertInFile: insertInFile
  },
  print: {
    info: info,
    colors: {
      bold: bold,
      muted: muted
    }
  }
}

test('adds itself and inserts into file', async t => {
  // filesystem
  const exists = sinon.stub().returns(true)
  // patching
  const isInFile = sinon.stub().returns(false)

  const context = {
    ...defaultContext,
    filesystem: {
      ...defaultContext.filesystem,
      exists: exists
    },
    ignite: {
      ...defaultContext.ignite,
      patching: {
        ...defaultContext.patching,
        isInFile: isInFile
      }
    }
  }

  await plugin.add(context)
  t.true(bold.calledWith('import DevscreensButton from \'../../ignite/DevScreens/DevscreensButton.js\''))
  t.true(muted.calledWith('// In your view JSX somewhere...'))
  t.true(setIgniteConfig.calledWith('examples', 'classic'))
  t.true(addAndroidPermission.calledWith('ACCESS_NETWORK_STATE'))
  t.true(addModule.calledWith('react-native-device-info', { link: true, version: '0.11.0' }))
  t.true(addModule.calledWith('prop-types', { version: '15.6.0' }))
  t.true(copyAsync.calledWith(`${sourceFolder}`, `${process.cwd()}/ignite/DevScreens`, { overwrite: true }))
  t.true(setDebugConfig.calledWith('showDevScreens', '__DEV__', true))
  t.true(exists.calledWith(launchScreen))
  t.true(isInFile.calledWith(launchScreen, 'import DevscreensButton'))
  t.true(insertInFile.calledWith(launchScreen, 'from \'react-native\'', 'import DevscreensButton from \'../../ignite/DevScreens/DevscreensButton.js\'\n'))
  t.true(isInFile.calledWith(launchScreen, '<DevscreensButton />'))
  t.true(insertInFile.calledWith(launchScreen, '</ScrollView>', '          <DevscreensButton />', false))
})

test('adds itself and launch screen does not exist', async t => {
  // filesystem
  const exists = sinon.stub().returns(false)

  const context = {
    ...defaultContext,
    filesystem: {
      ...defaultContext.filesystem,
      exists: exists
    }
  }

  const MANUAL_INSTALL_INFO = '✨ DevScreens installed!'

  await plugin.add(context)
  t.true(bold.calledWith('import DevscreensButton from \'../../ignite/DevScreens/DevscreensButton.js\''))
  t.true(muted.calledWith('// In your view JSX somewhere...'))
  t.true(setIgniteConfig.calledWith('examples', 'classic'))
  t.true(addAndroidPermission.calledWith('ACCESS_NETWORK_STATE'))
  t.true(addModule.calledWith('react-native-device-info', { link: true, version: '0.11.0' }))
  t.true(addModule.calledWith('prop-types', { version: '15.6.0' }))
  t.true(copyAsync.calledWith(`${sourceFolder}`, `${process.cwd()}/ignite/DevScreens`, { overwrite: true }))
  t.true(setDebugConfig.calledWith('showDevScreens', '__DEV__', true))
  t.true(exists.calledWith(launchScreen))
  t.true(info.calledWith(sinon.match(MANUAL_INSTALL_INFO)))
})
