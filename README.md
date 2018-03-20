# vscode-favorite-items

Extension provides ability to add files and directories to favorites enabling quick access. Time saver for complex projects.

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press enter.

```
ext install vscode-favorite-items
```

## Usage

`vscode-favorite-items` save your favorite resource in workspace `settings.json`, and show them in a separate view

### Configuration

```javascript
{
    "favorites.resources": [], // resources path you prefer to mark
    "favorites.sortDirection": "ASC", // DESC, MANUAL
}
```

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/LICENSE)
