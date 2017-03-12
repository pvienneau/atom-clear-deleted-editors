'use babel';

import { CompositeDisposable } from 'atom';
import fs from 'fs';

export default {
    subscriptions : null,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-clear-deleted-editors:clean': () => this.cleanEditors(),
        }));

        atom.project.getDirectories().map(directory => {
            directory.onDidChange(e => {
                atom.workspace.getTextEditors().map(textEditor => {
                    // fs.access is recommended

                    if (!fs.existsSync(textEditor.getBuffer().file.getPath())) {
                        const pane = atom.workspace.getActivePane();

                        pane.removeItem(textEditor);
                    }
                });
            });
        });
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    serialize() {},
};
