document.addEventListener("DOMContentLoaded", () => {
  const questList = document.getElementById("quest-list");
  const quest = document.getElementById("quest");

  // Функция для загрузки квестов
  function loadQuestList() {
    fetch("http://localhost:3000/orders")
      .then((response) => {
        console.log("response:", response);

        if (!response.ok) {
          const errorMessage =
            response.status === 404
              ? "Квесты не найдены"
              : "Что-то пошло не так";
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((json) => {
        console.log("json:", json);

        questList.innerHTML = `
        <h2>Quests</h2>
        ${json
          .map(
            ({ id, title }) =>
              `<button data-id="${id}" id="quest_btn" class="quests_quest-list-item">${title}</button>`
          )
          .join("")}`;

        const btnsQuest = document.querySelectorAll("#quest_btn");

        btnsQuest.forEach((element) => {
          element.addEventListener("click", (event) => {
            event.preventDefault();

            const btnIndex = +parseInt(event.target.dataset.id);

            openQuest(btnIndex);
          });
        });
      });
  }
  loadQuestList();
  openQuest(1);
});

function formatDateToYYYYMMDD(dateInput) {
  const date = new Date(dateInput);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function openQuest(id) {
  fetch(`http://localhost:3000/orders/${id}`)
    .then((response) => {
      console.log("response:", response);

      if (!response.ok) {
        const errorMessage =
          response.status === 404 ? "Квест не найден" : "Что-то пошло не так";
        throw new Error(errorMessage);
      }
      return response.json();
    })
    .then((json) => {
      console.log("json:", json);

      let assignee = json.assignee;
      let { name: assigneeName, avatar: assigneeAvatar } = assignee;
      let {
        title,
        description,
        customerName,
        reward,
        status,
        deadline,
        createdAt,
      } = json;

      let statusColor;
      switch (status.toLowerCase()) {
        case "новый":
          statusColor = "green";
          break;
        case "в процессе":
          statusColor = "orange";
          break;
        case "завершен":
          statusColor = "blue";
          break;
        case "отменен":
          statusColor = "red"; 
          break;
        default:
          statusColor = "black";
      }

      createdAt = new Date(createdAt);

      quest.innerHTML = `
       <div class="quest_body_title">Quest</div>
          <div class="quest_body_desk">
              <div class="quest_body_desk_customer">
                  <div class="quest_body_desk_customer_img"><img src="./img/avatarC.jpg" alt=""></div>
                  <div class="quest_body_desk_customer_content">
                      <div class="quest_body_desk_customer_name">Имя заказчика: ${customerName}</div>
                      <div class="quest_body_desk_customer_reward">Награда: ${reward}</div>
                      <div class="quest_body_desk_customer_status" >Статус заказа: <span style="color: ${statusColor}"> ${status}</span></div>
                  </div>
              </div>
              <div class="quest_body_desk_text">
                  <div class="quest_body_desk_text_title">${title}</div>
                  <div class="quest_body_desk_text_desk">${description}</div>
                  <div class="quest_body_desk_text_create">Создан: ${formatDateToYYYYMMDD(
                    createdAt
                  )}</div>
                  <div class="quest_body_desk_text_deadline">Дедлайн: ${deadline}</div>
              </div>
          </div>
          <div class="quest_body_assignee-title">Исполнитель</div>
          <div class="quest_body_assignee_body">
              <div class="quest_body_assignee_body_img"><img src=${assigneeAvatar} alt=""></div>
              <div class="quest_body_assignee_body_name">${assigneeName}</div>
          </div>
      `;
    });
}
