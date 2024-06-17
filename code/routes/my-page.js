<!DOCTYPE html>
<html lang="en">
<head>
  <%- include('includes/head') %>
  <link rel="stylesheet" href="styles/my-page.css" />
  <script src="/scripts/change-my-page.js" defer></script>
</head>
<body>
  <%- include('includes/header') %>
  <main>
    <div class="container1">
      <h2 class="h2">My Page</h2>
      <div class="container2">
        <div class="profile">
          <div class="photo">
            <% if (user.profilePhoto) { %>
            <div
              class="photo-placeholder"
              id="photo-placeholder"
              style="
                background-image: url('<%= user.profilePhoto %>');
                width: 150px;
                height: 150px;
                background-size: cover;
                background-position: center;
              "
            ></div>
            <% } else { %>
            <div
              class="photo-placeholder"
              id="photo-placeholder"
              style="
                background-image: url('/image/default-placeholder.png');
                width: 150px;
                height: 150px;
                background-size: cover;
                background-position: center;
              "
            ></div>
            <% } %>
            <p>
              회원님을 알릴 수 있는 사진을 등록해 주세요.<br />등록된 사진은
              회원님의 게시물이나 댓글들에 사용됩니다.
            </p>
            <form id="profileForm" action="/upload-profile-photo" method="POST" enctype="multipart/form-data">
              <input type="file" id="fileInput" name="profilePhoto" accept=".jpg" style="display: none" onchange="previewPhoto()"/>
              <div id="button-group">
                <button type="button" onclick="document.getElementById('fileInput').click();" class="profile-photo-btn" id="change-button">사진 변경</button>
                <button type="submit" class="profile-photo-btn" id="save-button" style="display: none;">저장</button>
                <button type="button" onclick="resetPhoto()" class="profile-photo-btn" id="cancel-button" style="display: none;">취소</button>
              </div>
            </form>
          </div>
          <div class="nickname-box">
            <h3><%= user.nickname_join %></h3>
            <a href="change-nickname">닉네임 변경</a>
          </div>
        </div>

        <div class="D-DAY">
          <h3>목표 몸무게 <br /><%= user.goal_weight_join %> Kg</h3>
          <h2>D-<%= dDay %></h2>
          <a href="#">D-DAY 설정</a>
        </div>
      </div>
    </div>

    <div class="User_info">
      <h2>회원 정보</h2>
      <div class="basic-info">
        <div class="info-row" id="idDisplay">
          <label>아이디</label>
          <span id="currentId"><%= user.id_join %></span>
          <a class="btn" href="#" onclick="showIdChangeForm()">아이디 변경</a>
        </div>

        <div
          class="change-info-row"
          id="idChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newId">아이디</label>
          <input
            type="text"
            id="newId"
            class="new-input"
            placeholder="변경할 아이디 입력"
          />
          <div class="new-button">
            <button onclick="hideIdChangeForm()">취소</button>
            <button onclick="changeId()">변경</button>
          </div>
        </div>

        <div class="info-row">
          <label>비밀번호</label>
          <span>********</span>
          <a class="btn" href="change-pw">비밀번호 변경</a>
        </div>

        <div class="info-row" id="nameDisplay">
          <label>이름</label>
          <span><%= user.name_join %></span>
          <a class="btn" href="#" onclick="showNameChangeForm()">이름 수정</a>
        </div>
        <div
          class="change-info-row"
          id="nameChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newName">이름</label>
          <input
            type="text"
            id="newName"
            class="new-input"
            placeholder="변경할 이름 입력"
          />
          <div class="new-button">
            <button onclick="hideNameChangeForm()">취소</button>
            <button onclick="changeName()">변경</button>
          </div>
        </div>

        <div class="info-row" id="nicknameDisplay">
          <label>닉네임</label>
          <span><%= user.nickname_join %></span>
          <a class="btn" href="#" onclick="showNicknameChangeForm()"
            >닉네임 변경</a
          >
        </div>
        <div
          class="change-info-row"
          id="nicknameChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newNickname">닉네임</label>
          <input
            type="text"
            id="newNickname"
            class="new-input"
            placeholder="변경할 닉네임 입력"
          />
          <div class="new-button">
            <button onclick="hideNicknameChangeForm()">취소</button>
            <button onclick="changeNickname()">변경</button>
          </div>
        </div>

        <div class="info-row" id="birthDisplay">
          <label>생년월일</label>
          <span><%= user.birth_join %></span>
          <a class="btn" href="#" onclick="showBirthChangeForm()"
            >생년월일 변경</a
          >
        </div>
        <div
          class="change-info-row"
          id="birthChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newBirth">생년월일</label>
          <input
            type="date"
            id="newBirth"
            class="new-input"
            placeholder="변경할 생년월일 입력"
          />
          <div class="new-button">
            <button onclick="hideBirthChangeForm()">취소</button>
            <button onclick="changeBirth()">변경</button>
          </div>
        </div>

        <div class="info-row" id="telDisplay">
          <label>휴대전화</label>
          <span><%= user.telnumber_join %></span>
          <a class="btn" href="#" onclick="showTelChangeForm()"
            >휴대전화 변경</a
          >
        </div>
        <div
          class="change-info-row"
          id="telChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newTel">전화번호</label>
          <input
            type="tel"
            id="newTel"
            class="new-input"
            placeholder="변경할 전화번호 입력"
          />
          <div class="new-button">
            <button onclick="hideTelChangeForm()">취소</button>
            <button onclick="changeTel()">변경</button>
          </div>
        </div>

        <div class="info-row" id="heightDisplay">
          <label>키</label>
          <span><%= user.height_join %>cm</span>
          <a class="btn" href="#" onclick="showHeightChangeForm()">키 변경</a>
        </div>
        <div
          class="change-info-row"
          id="heightChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newHeight">키</label>
          <input
            type="number"
            id="newHeight"
            class="new-input"
            placeholder="변경할 키 입력"
          />
          <div class="new-button">
            <button onclick="hideHeightChangeForm()">취소</button>
            <button onclick="changeHeight()">변경</button>
          </div>
        </div>

        <div class="info-row" id="weightDisplay">
          <label>몸무게</label>
          <span><%= user.weight_join %>kg</span>
          <a class="btn" href="#" onclick="showWeightChangeForm()"
            >몸무게 변경</a
          >
        </div>
        <div
          class="change-info-row"
          id="weightChangeForm"
          style="display: none; margin-top: 10px"
        >
          <label for="newWeight">몸무게</label>
          <input
            type="number"
            id="newWeight"
            class="new-input"
            placeholder="변경할 몸무게 입력"
          />
          <div class="new-button">
            <button onclick="hideWeightChangeForm()">취소</button>
            <button onclick="changeWeight()">변경</button>
          </div>
        </div>
      </div>
    </div>

    <div class="User_info board_and_comment">
      <h2>게시판 이용 내역</h2>
      <div class="my-board">
        <div class="board-use-record">
          <div class="my-board record-list">
            <a href="/my-board">내가 쓴 글</a>
          </div>
          <div class="my-comment record-list">
            <a href="/my-comment">내가 쓴 댓글</a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    function previewPhoto() {
      const file = document.getElementById("fileInput").files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById(
            "photo-placeholder"
          ).style.backgroundImage = `url(${e.target.result})`;
          document.getElementById('change-button').style.display = 'none';
          document.getElementById('save-button').style.display = 'inline-block';
          document.getElementById('cancel-button').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
      }
    }

    function resetPhoto() {
      document.getElementById('photo-placeholder').style.backgroundImage = `url('<%= user.profilePhoto %>')`;
      document.getElementById('change-button').style.display = 'inline-block';
      document.getElementById('save-button').style.display = 'none';
      document.getElementById('cancel-button').style.display = 'none';
      document.getElementById('fileInput').value = ''; // 파일 선택 초기화
    }
  </script>
</body>
</html>
