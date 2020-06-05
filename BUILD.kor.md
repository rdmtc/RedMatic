# Build Process


* `addon_files/redmatic/lib/package.json` (Node-RED, npm, Modules with binary dependencies)
* `addon_files/redmatic/var/package.json` (additional Node-RED nodes)
* `addon_files/redmatic/www/package.json` (Modules used by config UI, jQuery, Bootstrap, Bcrypt.js)
에서 종속성이 정의된다.

addon과 함께 번들로 제공되는 Node.js 버전은 `"engines":{"node":"<version>"}}` 아래의 
`./package.jason`에 정의되어 있다.


## Binary Modules <바이너리 모듈>

빌드를 시작하기 전에 필요한 바이너리 모듈은 `prebuild.sh` 스크립트에 의해 생성되며, 나는 로컬로 이 작업을 하고 있고, 
그후에 바이너리가 git repo에 추가된다. 이것은 내게 달갑지 않은 것이지만, (QEMU를 통해) 트래비스에 바이너리를 만드는 노력은 
상당히 높으며, 트라비스는 45분으로 제한하는데, 이것은 충분하지 않다-특히 QEMU를 사용할 때는... 교차-컴파일도 현실적으로 불가능하고, 
노드-gyp이 빌드를 완전히 제어하는 것도 아니다...


## Pipeline <파이프라인>

The Travis Job은 태그를 설정하고 릴리즈를 생성하고 `build.sh`를 실행하며 `dist` 폴더에 파일을 업로드한 후 
`update_release_body.sh`를 호출한다. 이 작업은 수동으로 트리거된다.

`build.sh`는 CCU 부록과 패키지 파일을 만들어 `dist` 폴더에 넣는다. 또한 `RELEASE_BODY.md`를 생성하고 
Github Wiki에서 `CHANGE_HISTORY`를 업데이트한다.


## Update Dependencies <종속성 업데이트>

`update.sh`는 앞에서 언급된  3개의 package.json 파일들에 정의된 모든 종속성을 가장 최근의 버전으로 업데이트하고, 
`./package.json`(david-dm/libraries.io에 의한 업데이트/이슈에 대한 모든 종속성을 확인할 수 있는 한 곳이 있어야 함)과 결합하는 
`update_package.js`을 호출한다. 또한 `docs/README.header.md`, `wiki/Intro.md`, `wiki/Home.md` 및 `docs/README.footer.md`를 
`README.md` 파일에 병합하는 `update_readme.js`를 호출한다.


## Update 3rd Party Licenses <3rd Party Licences 업데이트>

`update_reduced.js`는 `LICENSES.md` 및 `addon_files/redmatic/redw/properties.js` 파일을 생성한다. 이렇게 하려면 `addon_tmp`에 
모든 종속성이 이미 설치되어 있어야 하므로 이 스크립트를 실행하기 전에 로컬 빌드를 수행해야 한다.
