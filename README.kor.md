<img height="112px" src="assets/redmatic5-compact.png" align="left"/>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Dependencies Status](https://david-dm.org/rdmtc/redmatic/status.svg)](https://david-dm.org/rdmtc/redmatic)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Homematic CCU3](https://www.eq-3.de/produkte/homematic/zentralen-und-gateways/smart-home-zentrale-ccu3.html) 및
[RaspberryMatic](https://github.com/jens-maus/RaspberryMatic)용 Addon으로[Node-RED](https://nodered.org/about/) 사용**


_RedMatic_ 은 Homematic CCU3나 RaspberryMatic에 편안하게 설치할 수 있는 소프트웨어 패키지인 CCU Addon에 여러 소프트웨어 구성요소를 결합한다. Homematic은 제조사 [eQ-3](https://eq-3.de)의 스마트 홈 자동화 제품 시리즈로, 특히 독일에서 인기가 높다.

기초는 [CCU Nodes 용 Node-RED](https://github.com/rdmtc/node-red-contrib-ccu)와 [Node-RED](https://nodered.org/about/)로 구성된다. 이러한 구성요소는 Homematic 시스템을 위한 외부 서비스 및 시스템에 대한 규칙, 자동화, 스크립트 및 연결을 시각적이고 쉬운 가능성을 제공한다. 프로그래밍 지식 없이도 넓게 확장하는 것이다. [Wiki](https://github.com/rdmtc/RedMatic/wiki)에서 Node-RED와 일부 애플리케이션 예(일명 Flow)에 대한 자세한 정보를 찾을 수 있다.

시각화 및 제어를 위한 [RedMatic WebApp](https://github.com/rdmtc/RedMatic-WebApp) 및 [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard)가 포함되어 있다. RedMatic WebApp은 추가적인 환경설정 없이(WebMatic 또는 Yahui와 비교 가능), 즉시 사용할 수 있는 사용자 인터페이스다. Node-RED 대시보드는 RedMatic WebApp보다 더 많은 가능성을 제공할 수 있는 구성 가능한 사용자 인터페이스지만, 약간의 환경설정 작업이 필요하다.
스크린샷 예: [RedMatic WebApp](https://github.com/rdmtc/RedMatic/wiki/Webapp), [Node-RED Dashboard](https://github.com/rdmtc/RedMatic/wiki/Dashboard-Screenshots).

또한 포함된 확장명 [RedMatic HomeKit](https://github.com/rdmtc/RedMatic/wiki/Homekit)은 Siri와 HomeKit 앱을 통해 노드-RED에서 Homematic 장치 및 기타 사용 가능한 시스템을 제어할 수 있게 해준다.

편리하게 구성 가능한 주제와 페이로드 구조를 가진 [MQTT](https://github.com/rdmtc/RedMatic/wiki/Flow-MQTT) 브로커에 CCU의 연결은 특수 노드에 의해 단순화된다.

또한, Node-RED 주변의 크고 활동적인 커뮤니티는 쉽게 [설치할 수 있고](https://github.com/rdmtc/RedMatic/wiki/Node-Installation) 다양한 다른 서비스와 시스템에 대한 연결을 제공하는 [수천 개의 추가 노드](https://flows.nodered.org/?type=node&num_pages=1)로 구성된 라이브러리를 만들었다.
- such as the Xiaomi Aqara Smart Home System, Loxone, the Logitech Harmony Hub, various Smart TVs and AV receivers, Sonoff, Hue, Lightify, Tradfri, ArtNET/DMX, Modbus, Amazon Alexa, Google Home, various databases such as InfluxDB or MySQL, web services to query weather data and much more.

따라서 _RedMatic_ 은 특히 CCU 이외의 다른 서버를 실행하기를 원하지 않는 사람들을 위해 Home Assistant, ioBroker, OpenHAB 또는 FHEM과 같은 "성숙한" 스마트 홈 시스템의 대안을 제공할 수 있다. 
 Homematic 시스템의 자동화를 위해, RedMatic은 또한 "Rega"의 대안이나 보충물로 사용될 수 있다.
프로그램/스크립트.

## 요구사항(Requirements)

_RedMatic_ 은 __CCU3와 RasberryMatic에만 적합하다__. RedMatic은 200MB 이상의 메모리를 소비할 수 있으므로 1GB RAM(Pi 2B 이상)이 포함된 RasberryPi를 사용하는 것이 좋다. On the CCU1/2 _RedMatic_ can not be used.

A modern browser is required to use the web interfaces, Internet Explorer is not supported.


## Quick Start

On the [Releases](https://github.com/rdmtc/RedMatic/releases/latest) Page the file `redmatic-<version>.tar.gz` is available for download. After the installation of the addon via the Homematic WebUI (Control Panel -> additional software) and the subsequent reboot of the CCU is Node-RED is reachable at `http://<ccu-addresse>/addons/red`. Patience is required during installation, it can take up to ~10 minutes. Some sample flows as well as a simple dashboard are already preconfigured, the dashboard is reachable at `http://<ccu-address>/addons/red/ui`. 


## Support, Contributing

For feedback of any kind, questions, suggestions, wishes and bug reports please use the 
[Issue Tracker](https://github.com/rdmtc/RedMatic/issues). Alternatively there is [Slack](https://join.slack.com/t/homematicuser/shared_invite/enQtNDgyNDM2OTkyMDA2LWY1YjY0NTE0NmY0OWM3YWUzMzAzMTgxYmRjMTMyOWE3NjkxNDdlMDY5ZjlhYzM5Nzg2N2U2YjdmNzNlYWNhNTU). 

Participation in any form is welcome and desired, especially all users are invited to extend the [list of successfully tested nodes](https://github.com/rdmtc/RedMatic/wiki/Erfolgreich-getestete-Nodes), to publish sample flows and to contribute to the improvement and extension of the [documentation](https://github.com/rdmtc/RedMatic/wiki).

No donations will be accepted, but I would be happy if the successful usage of this software is acknowledged by giving the project a Github star ⭐️

## Documentation

Sorry, the Documentation is not yet translated into English. [German Documentation](https://github.com/rdmtc/RedMatic/wiki/Home)


## Licenses

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2020 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2020 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* [Third Party Licenses](LICENSES.md)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
