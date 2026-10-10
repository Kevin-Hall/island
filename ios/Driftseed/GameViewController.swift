import UIKit
import WebKit

/// Full-screen host for the game: one WKWebView showing the bundled page (Web/index.html), plus the small native
/// bridge the page needs on iOS: save backup (SaveStore) and haptics for the page's navigator.vibrate calls.
final class GameViewController: UIViewController {
    private var webView: WKWebView!
    private lazy var lightTap = UIImpactFeedbackGenerator(style: .light)
    private lazy var mediumTap = UIImpactFeedbackGenerator(style: .medium)
    private lazy var heavyTap = UIImpactFeedbackGenerator(style: .heavy)

    /// The page's sky blue (its theme-color), shown behind the page while it boots so there's no white flash.
    private static let backdrop = UIColor(red: 0x78 / 255, green: 0xb4 / 255, blue: 0xee / 255, alpha: 1)

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: BundleSchemeHandler.scheme)
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        config.dataDetectorTypes = []

        let content = config.userContentController
        let proxy = WeakMessageProxy(self)
        content.add(proxy, name: "saves")
        content.add(proxy, name: "haptic")
        content.addUserScript(Self.bridgeScript())

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = Self.backdrop
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.backgroundColor = Self.backdrop
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true } // Safari > Develop > [device] while debugging
        #endif
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Self.backdrop
        webView.load(URLRequest(url: BundleSchemeHandler.startURL))
    }

    #if DEBUG
    private static let isRelease = false
    #else
    private static let isRelease = true
    #endif

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    // The game has buttons along the bottom edge: make the system's edge swipes need a second swipe.
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { .all }

    // MARK: - The bridge script

    /// Runs before the game in every page load:
    /// - once per launch, restores any save slot WebKit has cleared from localStorage (from SaveStore's copy)
    /// - mirrors every localStorage write to SaveStore
    /// - gives the page a navigator.vibrate (iOS has none) that plays a haptic
    /// - in Release builds (TestFlight, the App Store) sets DRIFTSEED_RELEASE, which hides the game's Developer settings
    private static func bridgeScript() -> WKUserScript {
        let snapshot = SaveStore.shared.snapshot()
        let data = (try? JSONSerialization.data(withJSONObject: snapshot)) ?? Data("{}".utf8)
        let saved = String(data: data, encoding: .utf8) ?? "{}"
        let source = """
        (function () {
          window.DRIFTSEED_RELEASE = \(isRelease);
          var ls;
          try { ls = window.localStorage; } catch (e) { return; }
          var post = function (name, m) { try { window.webkit.messageHandlers[name].postMessage(m); } catch (e) {} };
          // Restore only on the first load after launch: a reload inside the game (after a reset, say) must not
          // bring back a save the player just cleared.
          try {
            if (!sessionStorage.getItem('__driftseedRestored')) {
              sessionStorage.setItem('__driftseedRestored', '1');
              var saved = \(saved);
              for (var k in saved) if (ls.getItem(k) === null) ls.setItem(k, saved[k]);
            }
          } catch (e) {}
          var S = Storage.prototype, set = S.setItem, del = S.removeItem, clr = S.clear;
          S.setItem = function (k, v) { set.call(this, k, v); if (this === ls) post('saves', { op: 'set', k: String(k), v: String(v) }); };
          S.removeItem = function (k) { del.call(this, k); if (this === ls) post('saves', { op: 'del', k: String(k) }); };
          S.clear = function () { clr.call(this); if (this === ls) post('saves', { op: 'clear' }); };
          if (!navigator.vibrate) {
            try {
              Object.defineProperty(navigator, 'vibrate', {
                configurable: true,
                value: function (p) { post('haptic', Array.isArray(p) ? (p[0] || 0) : (+p || 0)); return true; }
              });
            } catch (e) {}
          }
        })();
        """
        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    fileprivate func receive(_ message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame else { return }
        switch message.name {
        case "saves":
            guard let body = message.body as? [String: Any], let op = body["op"] as? String else { return }
            switch op {
            case "set":
                if let k = body["k"] as? String, let v = body["v"] as? String { SaveStore.shared.set(k, v) }
            case "del":
                if let k = body["k"] as? String { SaveStore.shared.remove(k) }
            case "clear":
                SaveStore.shared.removeAll()
            default:
                break
            }
        case "haptic":
            let ms = (message.body as? NSNumber)?.doubleValue ?? 10
            let generator = ms >= 22 ? heavyTap : ms >= 12 ? mediumTap : lightTap
            generator.impactOccurred()
        default:
            break
        }
    }
}

// MARK: - Navigation

extension GameViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url, let scheme = url.scheme?.lowercased() else {
            decisionHandler(.cancel)
            return
        }
        switch scheme {
        case BundleSchemeHandler.scheme, "about", "data", "blob":
            decisionHandler(.allow)
        case "http", "https", "mailto":
            // The game never leaves the app: a link out opens in Safari.
            if navigationAction.navigationType == .linkActivated { UIApplication.shared.open(url) }
            decisionHandler(.cancel)
        default:
            decisionHandler(.cancel)
        }
    }

    /// iOS can stop a web page's process under memory pressure: start the game again (its save is safe in
    /// localStorage and SaveStore).
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        SaveStore.shared.flush()
        let content = webView.configuration.userContentController
        content.removeAllUserScripts()
        content.addUserScript(Self.bridgeScript())
        webView.load(URLRequest(url: BundleSchemeHandler.startURL))
    }
}

// MARK: - Dialogs (the page uses prompt() to rename animals)

extension GameViewController: WKUIDelegate {
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, ["http", "https"].contains(url.scheme?.lowercased() ?? "") {
            UIApplication.shared.open(url)
        }
        return nil
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        presentOrSkip(alert) { completionHandler() }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        presentOrSkip(alert) { completionHandler(false) }
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        alert.addTextField { field in
            field.text = defaultText
            field.autocapitalizationType = .words
            field.clearButtonMode = .whileEditing
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { [weak alert] _ in
            completionHandler(alert?.textFields?.first?.text)
        })
        presentOrSkip(alert) { completionHandler(nil) }
    }

    private func presentOrSkip(_ alert: UIAlertController, otherwise: () -> Void) {
        guard presentedViewController == nil, view.window != nil else { otherwise(); return }
        present(alert, animated: true)
    }
}

/// WKUserContentController holds its message handlers strongly; this keeps it from holding the view controller.
private final class WeakMessageProxy: NSObject, WKScriptMessageHandler {
    private weak var target: GameViewController?
    init(_ target: GameViewController) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.receive(message)
    }
}
