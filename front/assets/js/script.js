let draggedElement = null;

function onDragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', event.target.id);
}

function onDragOver(event) {
    event.preventDefault();

    const dropzone = document.querySelector(".tasks");

    const afterElement = getDragAfterElement(dropzone, event.clientY);
    
    if (afterElement === null) {
        dropzone.appendChild(draggedElement);
    } else {
        dropzone.insertBefore(draggedElement, afterElement);
    }

    event.dataTransfer.clearData();
}

function onDrop(event) {
    const id = event.dataTransfer.getData('text');
    draggedElement = null;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.box.task[draggable=true]:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}