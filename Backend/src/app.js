import express from "express";
import cors from 'cors';

// Importamos las rutas que creamos en la carpeta routes
import estadisticasRoutes from './routes/estadisticas.routes.js';

const app = express();
app.use(cors({ origin: '*' }));

// Aumentamos el límite del tamaño del payload a 10mb
app.use(express.json({ limit: '10mb' }));

// Le decimos al servidor que rutas usar
app.use('/api', estadisticasRoutes);

// Por si se solicita un endpoint que no exista
app.use((req, res, next) => {
    console.log("Petición a ruta no encontrada, respondiendo eso...");
    res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
