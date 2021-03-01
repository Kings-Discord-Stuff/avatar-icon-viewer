import { Plugin } from "@vizality/entities";
import { patch, unpatch } from "@vizality/patcher";
import { getModule, React } from "@vizality/webpack";
const { open: openModal } = require('@vizality/modal');
import { ImageModal, ContextMenu } from '@vizality/components';

const copyToClipboard = require("electron").clipboard.writeText;

export default class AvatarIconViewer extends Plugin {
  start() {
    this._patchGuildMenu();
    this._patchUserMenu();
    this._patchGroupDMMenu();
    this._patchDMMenu();
  }

  _patchGuildMenu() {
      const GuildContextMenu = getModule(m => m.default && m.default.displayName === 'GuildContextMenu');

      patch("guild-context", GuildContextMenu, "default", ([{guild}], res) => {
          
        res.props.children.splice(0, 0, this.createContext(guild.getIconURL(getModule(['hasAnimatedGuildIcon'], false).hasAnimatedAvatar(guild) ? "gif" : "webp").split("?")[0]+"?size=2048", "Icon"));
            
        return res;
      });
  }

  _patchUserMenu() {
    const UserContextMenu = getModule(m => m.default && m.default.displayName && (m.default.displayName.endsWith("UserContextMenu")));
    
    patch("user-context", UserContextMenu, "default", ([{user}], res) => { 
      
      res.props.children.props.children.splice(0, 0, this.createContext(user.getAvatarURL(getModule(['hasAnimatedAvatar'], false).hasAnimatedAvatar(user) ? "gif" : "webp").split("?")[0]+"?size=2048",`Avatar`));
      return res;
    });
  }
  
  _patchGroupDMMenu() {
    const GroupDMContextMenu = getModule(m => m.default && m.default.displayName && m.default.displayName.endsWith("GroupDMContextMenu"));
    
    patch('group-dm-context', GroupDMContextMenu, "default", ([{channel}], res) => {
    
      res.props.children.splice(0, 0, this.createContext(getModule('getChannelIconURL').getChannelIconURL(channel), `Group DM Icon`))

      return res

    });
  }
  _patchDMMenu() {
    const DMUserContextMenu = getModule(m => m.default && m.default.displayName === "DMUserContextMenu");

    patch("user-dm-menu", DMUserContextMenu, "default", ([{user}], res) => {
      
      res.props.children.props.children.splice(0, 0, this.createContext(user.getAvatarURL(getModule(['hasAnimatedAvatar'], false).hasAnimatedAvatar(user) ? "gif" : "webp").split("?")[0]+"?size=2048", "Avatar"))

      return res
    })

  }

  createContext(url, type) {
    
    return <ContextMenu.Group>
      <ContextMenu.Item
        id="aiw-view"
        label={'Preview ' + type}
        action={ () => openModal(() => ( <ImageModal src={url} width='2048' height='2048' /> )) }
        />

        <ContextMenu.Item
        id="aiw-copy"
        label={'Copy ' + type + ' URL'}
        action={ () => copyToClipboard(url) }
        />
    </ContextMenu.Group>

  }

  stop() {
    unpatch('guild-context');
    unpatch('server-menu');
    unpatch('user-context');
    unpatch('group-dm-context');
    unpatch('user-dm-menu');
  }
}
