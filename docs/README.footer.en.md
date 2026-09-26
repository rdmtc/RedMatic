## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) is a Homematic CCU firmware based on OpenCCU **without
ReGaHSS** (under development, for test systems only). RedMatic runs on it with the same package, the same settings and
the same flows as on a CCU3 or OpenCCU, and is installed from the system's addon catalogue (*Addons → Catalogue*).
Whether RedMatic runs on a CCU or on openccu-lite is detected at runtime; nothing has to be configured.

* The `node-red-contrib-ccu` nodes work as usual over `rfd`, `hs485d` and `hmipserver`. Device, channel, room and
  function names come from the system's metadata API instead of ReGaHSS; `msg.channelName`, `msg.rooms`,
  `msg.functions` and the room/function filters keep their shape. When Node-RED does not run on the system itself, an
  API token of the system goes into the connection node's **openccu-lite token** field.
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
