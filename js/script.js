document.addEventListener("DOMContentLoaded", () => {
  const questList = document.getElementById("quest-list");
  const quest = document.getElementById("quest");

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
              `<button data-id="${id}" id="quest_btn" class="quests_quest-list-item">${title} </button>`
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
        case "завершён":
          statusColor = "blue";
          break;
        case "отменён":
          statusColor = "red";
          break;
        default:
          statusColor = "black";
      }

      createdAt = new Date(createdAt);

      quest.innerHTML = `
       <div class="quest_body_title">Quest <button data-id="${id}" class="quest_delete"><img src="/img/delete.svg" alt="delete"></button></div>
          <div class="quest_body_desk">
                      <div id="modal-delete" class="modal hidden">
                <div class="modal-content">
                    <p>Вы уверены, что хотите удалить этот квест?</p>
                    <button id="confirm-delete" class="btn-confirm">Удалить</button>
                    <button id="cancel-delete" class="btn-cancel">Отмена</button>
                </div>
            </div>
              <div class="quest_body_desk_customer">
                  <div class="quest_body_desk_customer_img"><img src="./img/avatarC.jpg" alt=""></div>
                  <div class="quest_body_desk_customer_content">
                      <div class="quest_body_desk_customer_name">Заказчик: ${customerName}</div>
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
           <button data-id="${id}" id="quest_edit"><img src="/img/edit.svg" alt="edit"></button>

              </div>
          </div>
          <div class="quest_body_assignee-title">Исполнитель</div>
          <div class="quest_body_assignee_body">
              <div class="quest_body_assignee_body_img"><img src=${assigneeAvatar} alt=""></div>
              <div class="quest_body_assignee_body_name">${assigneeName}</div>
          </div>
           <div class="modal" id="edit-modal">
  <div class="modal-content">
    <h2>Редактировать квест</h2>
    <form id="edit-form">
      <label for="edit-title">Название:</label>
      <input type="text" id="edit-title" name="title" required />
      <label for="edit-description">Описание:</label>
      <textarea id="edit-description" name="description" rows="4" required></textarea>
      <div class="modal-buttons">
        <button type="submit" class="btn-confirm">Сохранить</button>
        <button type="button" class="btn-cancel" id="cancel-edit">Отмена</button>
      </div>
    </form>
  </div>
</div>
      `;

      const btnDeleteQuest = document.querySelector(".quest_delete");
      btnDeleteQuest.addEventListener("click", (event) => {
        event.preventDefault();

        deleteQuest(id);
      });
      const editModal = document.getElementById("edit-modal");
      const editForm = document.getElementById("edit-form");
      const editTitle = document.getElementById("edit-title");
      const editDescription = document.getElementById("edit-description");
      const cancelEditButton = document.getElementById("cancel-edit");

      document.addEventListener("click", (event) => {
        if (event.target.closest("#quest_edit")) {
          const questId = event.target.closest("#quest_edit").dataset.id;

          function openEditModal(quest) {
            editTitle.value = quest.title;
            editDescription.value = quest.description;
            editModal.classList.add("visible");
          }



          fetch(`http://localhost:3000/orders/${questId}`)
            .then((response) => response.json())
            .then((quest) => openEditModal(quest))
            .catch((error) => console.error("Error fetching quest:", error));
        }
      });
      function closeEditModal() {
        editModal.classList.remove("visible");
      }

      editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const questId = document.querySelector("#quest_edit").dataset.id;

        const updatedQuest = {
          title: editTitle.value,
          description: editDescription.value,
        };

        fetch(`http://localhost:3000/orders/${questId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuest),
        })
          .then((response) => {
            if (response.ok) {
              console.log("Quest updated successfully");
              closeEditModal();
              openQuest(questId); 
            } else {
              console.error("Failed to update quest");
            }
          })
          .catch((error) => console.error("Error updating quest:", error));
      });

      cancelEditButton.addEventListener("click", closeEditModal);
    });
}

function deleteQuest(id) {
  const modal = document.getElementById("modal-delete");
  const confirmDelete = document.getElementById("confirm-delete");
  const cancelDelete = document.getElementById("cancel-delete");

  modal.classList.add("visible");

  confirmDelete.onclick = () => {
    fetch(`http://localhost:3000/orders/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Квест успешно удалён");
          quest.innerHTML = "";
          loadQuestList();
        } else {
          console.error("Не удалось удалить квест");
        }
      })
      .catch((error) => console.error("Ошибка:", error))
      .finally(() => {
        modal.classList.remove("visible");
      });
  };

  cancelDelete.onclick = () => {
    modal.classList.remove("visible");
  };
}

// function editQuest(id)
