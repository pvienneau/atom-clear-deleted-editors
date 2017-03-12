'use babel';

import { CompositeDisposable } from 'atom';
import fs from 'fs';

export default {
    subscriptions : null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
            const file = textEditor.getBuffer().file;

            if (!file) return false;

            let traversedDirectory = file.getParent();

            if (!traversedDirectory.existsSync()) return false;

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

            if (textEditor.getBuffer().file.existsSync()) return false;

            atom.workspace.getActivePane().removeItem(textEditor);
        });
    }
};
