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

        this.clean();

        this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
            const file = textEditor.getBuffer().file;

            if (!file) return false;

            let traversedDirectory = file.getParent();

            while(atom.project.contains(traversedDirectory.getPath())){
                this.subscriptions.add(traversedDirectory.onDidChange(this.clean));
                traversedDirectory = traversedDirectory.getParent();
            }

            this.subscriptions.add(traversedDirectory.onDidChange(this.clean));
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    serialize() {},

    clean() {
        atom.workspace.getTextEditors().map(textEditor => {
            const file = textEditor.getBuffer().file;

            if (!file) return false;

            fs.access(textEditor.getBuffer().file.getPath(), err => {
                if (!err) return false;

                const pane = atom.workspace.getActivePane();

                pane.removeItem(textEditor);
            });
        });
    }
};
