import UIKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = GameViewController()
        window.makeKeyAndVisible()
        self.window = window
    }

    private var saveTask: UIBackgroundTaskIdentifier = .invalid

    func sceneDidEnterBackground(_ scene: UIScene) {
        // The page saves when it's hidden; give that last save a moment to arrive, then make sure it's on disk.
        guard saveTask == .invalid else { return }
        saveTask = UIApplication.shared.beginBackgroundTask(withName: "SaveGame") { [weak self] in
            self?.finishSave()
        }
        Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 500_000_000)
            self?.finishSave()
        }
    }

    private func finishSave() {
        SaveStore.shared.flush()
        guard saveTask != .invalid else { return }
        UIApplication.shared.endBackgroundTask(saveTask)
        saveTask = .invalid
    }
}
