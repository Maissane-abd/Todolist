const taskManager = {
    apiEndpoint: 'http://localhost:3000',


    /**
     * Récupére la liste des tâches depuis l'API.
     */
    fetchAndInsertTasksFromApi: async function (event) {

        // Récupère la liste des tâches à l'aide de la fonction fetch()
    try {
        console.log(`${taskManager.apiEndpoint}/tasks`);
        const response = await fetch(`${taskManager.apiEndpoint}/tasks`);

        // Si un code HTTP autre que 2XX est retourné par l'API
        if (!response.ok) {
        // Si la requête échoue, retournez null sans lancer d'exception
        console.error(`Erreur HTTP: ${response.status}`);
        return null;
    }

      // Si tout s'est bien passé, je récupère les données de la réponse
      const tasks = await response.json();

      // Boucle sur la liste des tâches
      tasks.forEach((task) => {
      // pour chaque tâche appeler la fonction insertTaskInHtml()
      taskManager.insertTaskInHtml(task);
    });

      return tasks;

    } catch (error) {
        console.log(error);
        alert(error);
        return null;
    }
},

    /**
     * Permet de créer une nouvelle tâche sur la page HTML. 
     * La fonction a un paramètre, un objet contenant les données de la tâche. 
     * Il est composé de 2 propriétés : l'id de la tâche et son nom.
     * 
     * Exemple : 
     * {
     *   id: 5,
     *   name: 'Faire les courses'
     * } 
     * 
     * @param {Object} taskData 
     */
    insertTaskInHtml: function (taskData) {

        // On récupère le HTML d'une tâche dans le template
        const taskTemplate = document.querySelector('.template-task');
        const newTask = document.importNode(taskTemplate.content, true);

        // On insère les données de la tâche dans le HTML
        newTask.querySelector('.task__name').textContent = taskData.name;
        newTask.querySelector('.task__input-name').value = taskData.name;
        newTask.querySelector('.task__input-id').value = taskData.id;
        newTask.querySelector('.task').dataset.id = taskData.id;

        // On écoute les événements sur les éléments créés
        newTask.querySelector('.task__delete').addEventListener(
            'click', taskManager.handleDeleteButton);
        
        newTask.querySelector('.task__edit').addEventListener(
            'click', taskManager.handleEditButton);

        newTask.querySelector('.task__edit-form').addEventListener(
            'submit', taskManager.handleEditForm);

        // On insère le HTML de la tâche dans la page
        document.querySelector('.tasks').append(newTask);

    },

    /**
     * Cette fonction est appelée quand le formumaire de création de tâche est soumis. 
     * 
     * @param {Event} event 
     */
    handleCreateForm: async function (event) {
        // Bloquer l'envoie du formulaire
        event.preventDefault();

        const FormContent = event.currentTarget

        // Récupérer les données du formulaire
        const taskFormData = new FormData(FormContent);

        // Envoyer les données à l'API
        try {
            // Envoyer les données à l'API
            const response = await fetch(`${taskManager.apiEndpoint}/tasks`, {
              // Pour la création d'une tache, on utilise la méthode HTTP POST
              method: 'POST',
              headers: {
                // Je précise que j'envoie les données au format JSON
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(Object.fromEntries(taskFormData)),
            });

            // Vérifier si la requête a réussi (code 2xx)
            if (response.ok) {

            // Attendre la réponse JSON de l'API
            const newTask = await response.json();

            // Après confirmation de l'API insérer la tâche dans la page (il y a une fonction toute prete pour ça ;) 
            // en utilisant la valeur de retour de l'API
            taskManager.insertTaskInHtml(newTask);

            // Je reset le formulaire
            FormContent.reset();

        } else {

            // En cas d'erreur, afficher le statut de l'erreur
            console.error('Erreur lors de la création de la tâche:', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de la communication avec l\'API:', error);
    }
},

    /**
     * Cette fonction est appelée quand l'utilisateur appuie sur le bouton de suppression.
     * 
     * @param {Event} event 
     */
    handleDeleteButton: async function (event) {

        try {
            // On récupère l'ID de l'élément à supprimer
            const taskHtmlElement = event.currentTarget.closest('.task');
            const taskId = taskHtmlElement.dataset.id;
    
            // On envoie la requête de suppression à l'API
            const response = await fetch(`${taskManager.apiEndpoint}/tasks/${taskId}`, {
                method: 'DELETE',
            });
    
            // Vérifier si la requête a réussi (code 2xx)
            if (response.ok) {
                // Supprimer l'élément dans la page HTML
                taskHtmlElement.remove();

                // Afficher la notification de suppression réussie
                const notificationElement = document.getElementById('notification');
                if (notificationElement) {
                notificationElement.classList.remove('is-hidden'); 
                setTimeout(() => {
                    notificationElement.classList.add('is-hidden');
                    // Masquer la notification après 3 secondes 
                }, 3000);
            } else {
                console.error('Erreur lors de l\'affichage de la notification. Élément de notification non trouvé.');
            }
        } else {
            // En cas d'erreur, afficher le statut de l'erreur
            console.error('Erreur lors de la suppression de la tâche:', response.status);
            }
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API:', error);
        }

    },

    /**
     * Cette fonction est appelée lors du click sur le bouton "modifier une tâche"
     * 
     * @param {Event} event 
     */
    handleEditButton: function (event) {
        // On récupére l'élément HTML de la tâche à modifier
        const taskHtmlElement = event.currentTarget.closest('.task');
        // On affiche l'input de modification
        taskHtmlElement.querySelector('.task__edit-form').style.display = 'flex';
        // On masque le titre
        taskHtmlElement.querySelector('.task__name').style.display = 'none';
    },

    /**
     * Cette fonction est appelée quand le formumaire de modification de tâche est soumis. 
     * 
     * @param {Event} event 
     */
    handleEditForm: async function (event) {
        try {
            // Bloquer l'envoi du formulaire
            event.preventDefault();
    
            // On récupère l'élément HTML complet de la tâche à modifier
            const taskHtmlElement = event.currentTarget.closest('.task');
    
            // Récupérer les données du formulaire
            const taskFormData = new FormData(event.currentTarget);
    
            // Récupérer l'id de la tâche à modifier
            const taskId = taskFormData.get('id');
    
            // Envoyer les données à l'API
            const response = await fetch(`${taskManager.apiEndpoint}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(taskFormData)),
            });
    
            // Après confirmation de l'API, modifier le nom de la tâche dans le span.task__name
            if (response.ok) {
                const updatedTask = await response.json();
                taskHtmlElement.querySelector('.task__name').textContent = updatedTask.name;
    
                // On affiche l'input de modification
                taskHtmlElement.querySelector('.task__edit-form').style.display = 'none';
                // On masque le titre
                taskHtmlElement.querySelector('.task__name').style.display = 'block';
            } else {
                // En cas d'erreur, afficher le statut de l'erreur
                console.error('Erreur lors de la modification de la tâche:', response.status);
            }
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API:', error);
        }
    },

};



