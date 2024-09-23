import express from "express";
import cors from 'cors';;

//importamos las rutas que creamos en la carpeta routes
import estadisticasRoutes from './routes/estadisticas.routes.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

//le decimos al servidor que rutas usar
app.use('/api', estadisticasRoutes);

//por si se solicita un endpoint que no exista
app.use((req, res, next) => {
    console.log("peticion a ruta no encontrada, respondiendo eso...");
    res.status(404).json({ message: 'Ruta no encontrada' });
})

export default app;