## RedMatic-HomeKit and RedMatic-Matter after a RedMatic update

After an update of RedMatic, RedMatic also brings the nodes
[RedMatic-HomeKit](https://github.com/rdmtc/RedMatic-HomeKit) and
[RedMatic-Matter](https://github.com/rdmtc/RedMatic-Matter) to their newest version - whichever way RedMatic is updated
(the CCU's additional software page, the update button of the RedMatic settings, the Addons page of openccu-lite). The
setting for it is on RedMatic's settings page and is **switched on**, also on systems that come from an older version.

* At the first start after the update Node-RED starts as usual. Beside it RedMatic asks the npm registry for newer
  versions of the two packages, installs them in one run into the Node-RED directory (the way the palette does) and
  then restarts Node-RED **once**. When there is nothing newer, nothing happens.
* Only these two packages, and only when they are installed. Other nodes stay as they are.
* It takes the newest version that fits this RedMatic version's Node.js and Node-RED; never a prerelease.
* A package that has an exact version (`4.1.4` instead of `~4.1.4`) or another source (file, git, URL) in
  `/usr/local/addons/redmatic/var/package.json` is not touched.
* Without a connection to the npm registry, or when npm fails, everything stays as it is: Node-RED keeps running, the
  message is in the log and on the settings page, and the next starts of RedMatic try again (three times per RedMatic
  update in all).
* When the setting is off at the update, the packages stay untouched until the next RedMatic update; they can be
  updated by hand in Node-RED's palette at any time.

## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) is a Homematic CCU firmware based on OpenCCU **without
ReGaHSS** (under development, for test systems only). RedMatic runs on it with the same package, the same settings and
the same flows as on a CCU3 or OpenCCU, and is installed from the system's addon catalogue (*Addons → Catalogue*).
Whether RedMatic runs on a CCU or on openccu-lite is detected at runtime; nothing has to be configured.

* The `node-red-contrib-ccu` nodes reach `rfd`, `hs485d` and `hmipserver` through the system's RPC interface
  (lite-rpc), without callback servers of their own. From RedMatic 9.15.1 this is the default: the system issues
  RedMatic a token of its own for it, and an existing connection is moved over once at the first start (one line in
  the log). To keep the direct connection, set *openccu-lite interfaces* in the connection node to *CCU*. Device,
  channel, room and function names come from the system's metadata API instead of ReGaHSS; `msg.channelName`,
  `msg.rooms`, `msg.functions` and the room/function filters keep their shape. When Node-RED does not run on the
  system itself, an API token of the system goes into the connection node's **openccu-lite token** field.
* The editor login with *Benutzer der Zentrale* uses the system's own users on openccu-lite.
* **There are no system variables, programs or HM-Script.** The `ccu-sysvar`, `ccu-program`, `ccu-script` and
  `ccu-poll` nodes stay in the flows but answer every message with an error.
* Node-RED and the addon log into the journal (`journalctl -t node-red -t redmatic`); the settings page's log reads it
  from there.

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
