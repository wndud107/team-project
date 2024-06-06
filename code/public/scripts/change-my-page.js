document.getElementById("fileInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    document.getElementById(
      "photo-placeholder"
    ).style.backgroundImage = `url(${e.target.result})`;
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

// 아이디
function showIdChangeForm() {
  document.getElementById("idDisplay").style.display = "none";
  document.getElementById("idChangeForm").style.display = "flex";
}
function hideIdChangeForm() {
    document.getElementById("idDisplay").style.display = "flex";
    document.getElementById("idChangeForm").style.display = "none";
}

async function changeId() {
  const newId = document.getElementById("newId").value;

  if (!newId) {
    alert("변경할 아이디를 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newId: newId }),
    });

    const result = await response.json();
    if (result.success) {
      alert("아이디가 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("아이디 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing ID:", error);
    alert("아이디 변경 중 오류가 발생했습니다.");
  }
}

// 이름
async function changeName() {
  const newName = document.getElementById("newName").value;

  if (!newName) {
    alert("새 이름을 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newName: newName }),
    });

    const result = await response.json();
    if (result.success) {
      alert("이름이 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("이름 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Name:", error);
    alert("이름 변경 중 오류가 발생했습니다.");
  }
}

function showNameChangeForm() {
  document.getElementById("nameDisplay").style.display = "none";
  document.getElementById("nameChangeForm").style.display = "flex";
}
function hideNameChangeForm() {
    document.getElementById("nameDisplay").style.display = "flex";
    document.getElementById("nameChangeForm").style.display = "none";
}

// nickname
async function changeNickname() {
  const newNickname = document.getElementById("newNickname").value;

  if (!newNickname) {
    alert("새 닉네임을 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-nickname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newNickname: newNickname }),
    });

    const result = await response.json();
    if (result.success) {
      alert("닉네임이 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("닉네임 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Nickname:", error);
    alert("닉네임 변경 중 오류가 발생했습니다.");
  }
}

function showNicknameChangeForm() {
  document.getElementById("nicknameDisplay").style.display = "none";
  document.getElementById("nicknameChangeForm").style.display = "flex";
}
function hideNicknameChangeForm() {
    document.getElementById("nicknameDisplay").style.display = "flex";
    document.getElementById("nicknameChangeForm").style.display = "none";
}

// 생년월일
async function changeBirth() {
  const newBirth = document.getElementById("newBirth").value;

  if (!newBirth) {
    alert("변경할 생일을 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-birth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newBirth: newBirth }),
    });

    const result = await response.json();
    if (result.success) {
      alert("생일이 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("생일 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Birth:", error);
    alert("생일 변경 중 오류가 발생했습니다.");
  }
}

function showBirthChangeForm() {
  document.getElementById("birthDisplay").style.display = "none";
  document.getElementById("birthChangeForm").style.display = "flex";
}
function hideBirthChangeForm() {
    document.getElementById("birthDisplay").style.display = "flex";
    document.getElementById("birthChangeForm").style.display = "none";
}

// 전화번호
async function changeTel() {
  const newTel = document.getElementById("newTel").value;

  if (!newTel) {
    alert("새 번호를 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-tel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newTel: newTel }),
    });

    const result = await response.json();
    if (result.success) {
      alert("번호가 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("번호 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Tel:", error);
    alert("번호 변경 중 오류가 발생했습니다.");
  }
}

function showTelChangeForm() {
  document.getElementById("telDisplay").style.display = "none";
  document.getElementById("telChangeForm").style.display = "flex";
}
function hideTelChangeForm() {
    document.getElementById("telDisplay").style.display = "flex";
    document.getElementById("telChangeForm").style.display = "none";
}

// height
async function changeHeight() {
  const newHeight = document.getElementById("newHeight").value;

  if (!newHeight) {
    alert("변경할 키를 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-height", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newHeight: newHeight }),
    });

    const result = await response.json();
    if (result.success) {
      alert("키가 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("키 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Height:", error);
    alert("키 변경 중 오류가 발생했습니다.");
  }
}

function showHeightChangeForm() {
  document.getElementById("heightDisplay").style.display = "none";
  document.getElementById("heightChangeForm").style.display = "flex";
}
function hideHeightChangeForm() {
    document.getElementById("heightDisplay").style.display = "flex";
    document.getElementById("heightChangeForm").style.display = "none";
}

// weight
async function changeWeight() {
  const newWeight = document.getElementById("newWeight").value;

  if (!newWeight) {
    alert("변경할 무게를 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/change-weight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newWeight: newWeight }),
    });

    const result = await response.json();
    if (result.success) {
      alert("무게가 성공적으로 변경되었습니다.");
      location.reload();
    } else {
      alert("무게 변경에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error changing Weight:", error);
    alert("무게 변경 중 오류가 발생했습니다.");
  }
}

function showWeightChangeForm() {
    document.getElementById("weightDisplay").style.display = "none";
    document.getElementById("weightChangeForm").style.display = "flex";
}
function hideWeightChangeForm() {
    document.getElementById("weightDisplay").style.display = "flex";
    document.getElementById("weightChangeForm").style.display = "none";
}
