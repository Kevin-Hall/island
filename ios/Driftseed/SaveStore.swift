import Foundation

/// A native copy of the game's localStorage (its save slots), kept in Application Support.
///
/// The game saves to localStorage, which WebKit can clear on its own (low storage, or a long break from the app).
/// Every write the page makes is mirrored here, and on launch any slot missing from localStorage is put back from
/// this copy before the game reads it. The file is included in the player's iCloud/device backups.
final class SaveStore {
    static let shared = SaveStore()

    private let queue = DispatchQueue(label: "SaveStore")
    private var values: [String: String] = [:]
    private var dirty = false
    private var pendingWrite: DispatchWorkItem?
    private let url: URL

    private init() {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Saves", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        url = dir.appendingPathComponent("localStorage.json")
        if let data = try? Data(contentsOf: url),
           let decoded = try? JSONDecoder().decode([String: String].self, from: data) {
            values = decoded
        }
    }

    /// Everything saved, for restoring into a fresh localStorage.
    func snapshot() -> [String: String] {
        queue.sync { values }
    }

    func set(_ key: String, _ value: String) {
        queue.async {
            guard self.values[key] != value else { return }
            self.values[key] = value
            self.scheduleWrite()
        }
    }

    func remove(_ key: String) {
        queue.async {
            guard self.values.removeValue(forKey: key) != nil else { return }
            self.scheduleWrite()
        }
    }

    func removeAll() {
        queue.async {
            guard !self.values.isEmpty else { return }
            self.values.removeAll()
            self.scheduleWrite()
        }
    }

    /// Writes now if anything changed (call when the app goes to the background).
    func flush() {
        queue.sync { self.writeIfDirty() }
    }

    // The game saves every few seconds: coalesce those into one disk write.
    private func scheduleWrite() {
        dirty = true
        pendingWrite?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.writeIfDirty() }
        pendingWrite = work
        queue.asyncAfter(deadline: .now() + 2, execute: work)
    }

    private func writeIfDirty() {
        guard dirty else { return }
        pendingWrite?.cancel()
        pendingWrite = nil
        do {
            let data = try JSONEncoder().encode(values)
            try data.write(to: url, options: [.atomic])
            dirty = false
        } catch {
            NSLog("SaveStore: couldn't write the save: \(error)")
        }
    }
}
