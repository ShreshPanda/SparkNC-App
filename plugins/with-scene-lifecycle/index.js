const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// iOS 26 requires UIScene lifecycle for apps built with the iOS 26 SDK.
// Expo SDK 54's generated AppDelegate is window-based only, so this plugin
// moves the React Native window bootstrap into a proper UIScene delegate.

const SCENE_DELEGATE_SWIFT = `import Expo
import React
import UIKit

public class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  public var window: UIWindow?

  public func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }
    let window = UIWindow(windowScene: windowScene)
    self.window = window

    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    appDelegate.window = window
    appDelegate.reactNativeFactory?.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: nil)
    window.makeKeyAndVisible()
  }

  public func scene(
    _ scene: UIScene,
    openURLContexts URLContexts: Set<UIOpenURLContext>
  ) {
    guard let url = URLContexts.first?.url else { return }
    _ = (UIApplication.shared.delegate as? AppDelegate)?.application(UIApplication.shared, open: url, options: [:])
  }
}
`;

const WINDOW_INIT_PATTERN = /#if os\(iOS\) \|\| os\(tvOS\)[\s\S]*?launchOptions: launchOptions\)\s*\n#endif/;

const withSceneLifecycle = (config) =>
  withXcodeProject(
    withDangerousMod(config, [
      'ios',
      async (cfg) => {
        const appDir = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName ?? '');
        const scenePath = path.join(appDir, 'SceneDelegate.swift');
        fs.writeFileSync(scenePath, SCENE_DELEGATE_SWIFT);

        const appDelegatePath = path.join(appDir, 'AppDelegate.swift');
        const appDelegate = fs.readFileSync(appDelegatePath, 'utf8');
        if (!WINDOW_INIT_PATTERN.test(appDelegate)) {
          throw new Error('with-scene-lifecycle: expected window init block not found in AppDelegate.swift');
        }
        fs.writeFileSync(appDelegatePath, appDelegate.replace(WINDOW_INIT_PATTERN, ''));
        return cfg;
      },
    ]),
    (cfg) => {
      const projectName = cfg.modRequest.projectName;
      const project = cfg.modResults;
      const target = project.getFirstTarget().uuid;
      const mainGroup = project.getFirstProject().firstProject.mainGroup;
      project.addSourceFile(`${projectName}/SceneDelegate.swift`, { target }, mainGroup);
      return cfg;
    },
  );

module.exports = withSceneLifecycle;
