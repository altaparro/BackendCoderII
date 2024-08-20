import mongoose from "mongoose"

mongoose.connect("mongodb+srv://matiasaltaparro:1234@cluster0.5b6yayi.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
   .then( () => console.log("conexion exitosa"))
   .catch( (error) => console.log("Error de conexion", error))