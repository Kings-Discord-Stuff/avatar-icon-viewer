import { Plugin } from "@vizality/entities";
import { patch, unpatch } from "@vizality/patcher";
import { getModule, React } from "@vizality/webpack";

const copyToClipboard = require("electron").clipboard.writeText;

export default class AvatarIconViewer extends Plugin {
  start() {
    this._patchGuildMenu();
    this._patchUserMenu();
  }

  _patchGuildMenu() {
      const GuildContextMenu = getModule(
        (m) => m.default && m.default.displayName === 'GuildContextMenu'
      );

      patch("guild-context", GuildContextMenu, "default", (props, res) => {
        const { guild } = props[0];
        const { icon }  = guild;
        const url = `https://cdn.discordapp.com/icons/${guild.id}/${icon}.png?size=2048`;
          
        res.props.children.splice(
          0,
          0,
          this.createContext(url, "Icon")
          );
            
        return res;
      });
  }

  _patchUserMenu() {
    const UserContextMenu = getModule(m => m.default && m.default.displayName && (m.default.displayName.endsWith("UserContextMenu") || m.default.displayName == "DMUserContextMenu"));

    patch("user-context", UserContextMenu, "default", (props, res) => {
      
      const { user } = props[0];
      const { avatar } = user;

      const url = `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.png?size=2048`;


      res.props.children.props.children.push(this.createContext(url, `Avatar`));
      return res;
    });
  }

  createContext(url, type) {
    const ContextMenu = getModule('MenuItem');

    return React.createElement(ContextMenu.MenuGroup, {
      children: [
        React.createElement(ContextMenu.MenuItem, {
          label: "Copy " + type + " Link",
          id: "aiv-copy",
          action: () => copyToClipboard(url),
        }),
      ],
    });
  }

  stop() {
    unpatch('guild-context');
    unpatch('server-menu');
    unpatch("user-context");
  }
}
