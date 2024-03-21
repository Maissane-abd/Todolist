const { Task } = require('../models');

const taskController = { 
  
  listTasks: async function (req, res) {
    try { 
    const data = await Task.findAll();
    res.json(data);

  } catch (error) {

    console.trace(error);
    res.status(500).send('Internal Server Error');
  }
},

  oneTask: async function (req, res) {
    try {
      const data = await Task.findByPk(req.params.id);
      
      // Dans le cas où la liste n'existe pas, on renvoie une erreur 404
      if (!data) {
        // On passe la main au middleware suivant
        next();
        // J'arrête l'exécution de ma fonction
        return;
      }
      res.json(data);

    } catch (error) {
      console.trace(error);
      res.status(500).send('Internal Server Error');
    }
  },

  async create(req, res) {
    try {
      
      // On valide les données envoyées dans le body de la requête
      const { name } = req.body;
  
      // Si les données ne sont pas valides, on renvoie une erreur 400
      if (!name) {
        res.status(400).json({ error: 'Le champ "name" est requis' });
        return;
      }
  
      // Créer les données à partir du modèle fourni
      const data = await Task.create({ name });
  
      // Retourner la tâche fraîchement créée au client
      res.status(201).json(data);
      console.log(data);

    } catch (error) {
      console.trace(error);
      res.status(500).send('Internal Server Error');
    }
  },

    async update(req, res, next) {
      try {
        
        // On valide les données envoyer dans le body de la requête
        const result = req.body;
        
        // Je met à jour ma tâche avec les données validées
        // update retourne un tableau avec en première position le nombre de lignes modifiées
        // J'utilise la destructuration pour récupérer la première valeur du tableau
        const [nbUpdated, dataUpdated] = await Task.update(result, {

          // On précise quelles lignes on veut mettre à jour
          // Celle dont l'id correspond au paramètre de la route
          where: {
            id: req.params.id,
          },

          // returning me permet de récupérer les données modifiées
          // je les récupère dans le deuxième élément du tableau retourné par update
          returning: true,
        });
  
        // Si aucune données n'a été modifiée, c'est que la liste n'existe pas
        if (!nbUpdated) {
          next();
          return;
        }
  
        // On retourne la liste qui a été modifier
        // techniquement, le update peut retourner plusieurs lignes
        // moi dans mon cas, je modifie en filtrant sur l'id, donc je suis sûr
        // de n'avoir qu'une seule ligne modifiée, je retourne donc le 1er élément du tableau
        res.json(dataUpdated[0]);

      } catch (error) {
        console.trace(error);
        res.status(500).send('Internal Server Error');
      }
    },

    async delete(req, res, next) {
      try {
        const nbDeleted = await Task.destroy({
          where: {
            id: req.params.id,
          },
        });
        // Si aucune données n'a été supprimée, c'est que la liste n'existe pas
        if (!nbDeleted) {
          next();
          return;
        }
        // 204 => On retourne rien mais tout c'est bien passé
        res.status(204).end();

      } catch (error) {
        console.trace(error);
        res.status(500).send('Internal Server Error');
      }
    },
};

module.exports = taskController;