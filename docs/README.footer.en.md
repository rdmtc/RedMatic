## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) is a Homematic CCU firmware **without ReGaHSS**. RedMatic
runs on it with the same package, the same settings and the same flows as on a CCU3, RaspberryMatic or OpenCCU. Which
kind of box it is running on is detected at runtime (`GET /api/meta/v1/version`); nothing has to be configured, and
moving a backup from one to the other changes nothing.

**What works**

* Node-RED itself with the palette manager, projects/git, the settings page and its session check, backup, log,
  log upload and the one-click self-update.
* Everything the `node-red-contrib-ccu` nodes do over the interface processes (`rfd`, `hs485d`, `hmipserver`): values,
  commands, RPC events. Device, channel, room and function names come from the box's metadata API instead of ReGaHSS
  and follow renames within a second. `msg.channelName`, `msg.rooms`, `msg.functions` and the room/function filters
  keep exactly the shape they have on a CCU.
* Names need a credential: on the box the read-only token in `/usr/local/etc/occulite/local-token` is picked up
  automatically (RedMatic runs as root there), so there is nothing to configure. Node-RED running *elsewhere* takes a
  token from the box's *Users* page in the connection node's **openccu-lite token** field.
* The admin login of the editor: the authentication setting *Benutzer der Zentrale* uses the ReGaHSS users on a CCU and
  the box's own users (`POST /api/auth/v1/login`) on openccu-lite.

**What has no replacement** (from openccu-lite's porting guide):

* **System variables** and **programs**: there is no ReGa DOM. The `ccu-sysvar`, `ccu-program` and `ccu-poll` nodes stay
  in the palette and in your flows — they are accepted, they never break the connection, and every message they get is
  answered with a clear error instead.
* **`exec()` of HM-Script** — `dom.GetObject`, `system.GetSessionVarStr` and everything else the `ccu-script` node
  sends: gone, same handling as above.
* **ReGa ids** (`dom.GetObject(1234)`): there are none. The metadata API identifies objects by
  `<interface>.<address>`; these nodes have always keyed on the address, so nothing changes for flows.
* **Service messages / alarms** (system variables 40 and 41): interface-level state only.
* **The CCU WebUI's JSON-RPC API** (`/api/homematic.cgi`, `Session.login`, `Device.listAll`): not present.

**On the systemd products** of openccu-lite the rc.d script runs in a generated unit `addon-redmatic.service`
(`Type=oneshot`, `RemainAfterExit=yes`, `KillMode=control-group`): `start` returns after backgrounding Node-RED and
`stop` stops it. There is no `/var/log/messages` there — Node-RED and the addon log into the journal under the tags
`node-red` and `redmatic` (`journalctl -t node-red -t redmatic`), and the settings page's log reads them from there.
RedMatic keeps no pid file (it finds its process by name), so nothing depends on a writable `/var/run`. What it writes:
its own directory `/usr/local/addons/redmatic` (`etc`, `var`, `tmp`, `home`, `lib`, `www`), `/tmp/redmatic-update`
(self-update state), `/usr/local/tmp` (backup archive and downloaded packages), `/etc/config/rdmtc.uuid` (the telemetry
id, skipped when that directory is not writable) and, at install time, `/usr/local/etc/config/rc.d`,
`/usr/local/etc/config/lighttpd` and `/usr/local/etc/config/addons/www`.

## Licenses

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* Third-party components are listed in the SBOM files (CycloneDX) attached to each [release](https://github.com/rdmtc/RedMatic/releases); the full license texts ship inside the addon in each package's `node_modules` directory

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
