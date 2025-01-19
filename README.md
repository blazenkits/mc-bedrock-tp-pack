# Minecraft Custom TP Pack

## 기능

### 특정 사용자에게 순간이동
`.tp <사용자이름>`
- 순간이동시, 경험치를 얼마정도 잃게 됩니다.

- tp만 입력할 경우 사용자의 목록을 볼 수 있습니다.

### 집으로 순간이동
`.home`

- 집 위치를 설정하지 않았을 경우 순간이동에 실패합니다.

### 집 위치를 설정
`.sethome`

- 사용자의 위치를 자신의 집으로 설정합니다.

- 사용자별로 다른 집을 가질 수 있습니다.

- 오버월드에서만 설정이 가능합니다.

### 데이터팩 재시작
`.restart`

`.restart default` (변수를 초기화)
- Operator 권한이 있어야 합니다.


## 변수 설정
### 변수 확인
`/scoreboard objectives setdisplay sidebar WORLD_CONFIG`

### 변수 설정
`/scoreboard players set 변수명 WORLD_CONFIG 설정값`

`.restart` (변경내용 적용)

### 변수명
`TP_CLEAR_LEVELS_AMOUNT` 순간이동시 사라지는 경험치의 양

`HOME_ENABLE`: 1로 설정시 `.home` 명령어를 활성화, 0으로 설정시 비활성화

`TP_ENABLE`: 1로 설정시 `.tp` 명령어를 활성화, 0으로 설정시 비활성화


## 설치 방법
### 로컬 서버
1. 다운로드된 .mcaddon 파일을 더블클릭하여 설치한다.

2. 설정의 실험 기능 > 베타 API를 체크한다.

3. 행동 팩 > "Custom TP Pack"을 활성화한다.

4. 리소스 팩 > "Custom TP Pack"을 활성화한다.

5. 월드를 시작한다.

### 릴름
<로컬 서버>의 설치법을 따른 후 월드를 릴름에 업로드한다.

### Bedrock Dedicated Server
1. 월드를 클라이언트에서 <로컬 서버>의 설치법을 따른다.
2. `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\minecraftWorlds`에 있는 월드 파일을 복사해서 서버의 `Worlds`폴더에 넣는다.


Tested on 1.21.51 with @minecraft/server:1.17.0-beta