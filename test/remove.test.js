const test = require('ava')
const sinon = require('sinon')
const plugin = require('../plugin')
const launchScreen = `${process.cwd()}/App/Containers/LaunchScreen.js`

// ignite
const removeModule = sinon.spy()
const removeIgniteConfig = sinon.spy()
const removeAndroidPermission = sinon.spy()
const removeDebugConfig = sinon.spy()
// filesystem
const remove = sinon.spy()
// patching
const replaceInFile = sinon.spy()

const defaultContext = {
  ignite: {
    removeModule: removeModule,
    removeIgniteConfig: removeIgniteConfig,
    removeAndroidPermission: removeAndroidPermission,
    removeDebugConfig: removeDebugConfig
  },
  patching: {
    replaceInFile: replaceInFile
  }
}

test('removes itself and launchscreen exists', async t => {
  // filesystem
  const exists = sinon.mock().returns(true)

  const context = {
    ...defaultContext,
    filesystem: {
      remove: remove,
      exists: exists
    }
  }

  await plugin.remove(context)
  t.true(removeIgniteConfig.calledWith('examples'))
  t.true(removeModule.calledWith('react-native-device-info', { unlink: true }))
  t.true(removeModule.calledWith('react-navigation'))
  t.true(removeAndroidPermission.calledWith('ACCESS_NETWORK_STATE'))
  t.true(remove.calledWith('ignite/DevScreens'))
  t.true(removeDebugConfig.calledWith('showDevScreens'))
  t.true(exists.calledWith(launchScreen))
  t.true(replaceInFile.calledWith(launchScreen, 'import DevscreensButton', ''))
  t.true(replaceInFile.calledWith(launchScreen, '<DevscreensButton />', ''))
})

test('removes itself and launchscreen does not exist', async t => {
  // filesystem
  const exists = sinon.mock().returns(false)

  const context = {
    ...defaultContext,
    filesystem: {
      remove: remove,
      exists: exists
    }
  }

  await plugin.remove(context)
  t.true(removeIgniteConfig.calledWith('examples'))
  t.true(removeModule.calledWith('react-native-device-info', { unlink: true }))
  t.true(removeModule.calledWith('react-navigation'))
  t.true(removeAndroidPermission.calledWith('ACCESS_NETWORK_STATE'))
  t.true(remove.calledWith('ignite/DevScreens'))
  t.true(removeDebugConfig.calledWith('showDevScreens'))
  t.true(exists.calledWith(launchScreen))
})
