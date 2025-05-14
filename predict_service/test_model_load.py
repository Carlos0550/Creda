import os
import sys
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Asegurarse que el directorio actual está en el path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar funciones necesarias
from model.mlservice import load_model

def test_model_performance():
    print("Iniciando evaluación del modelo...")
    
    try:
        # 1. Cargar el modelo
        model = load_model()
        if model is None:
            print("❌ La función load_model() devolvió None")
            return False
            
        print("✅ Modelo cargado exitosamente!")
        
        # 2. Cargar datos para evaluación
        try:
            X_train = pd.read_csv('train_dataset/X_train_preprocessed.csv')
            y_train = pd.read_csv('train_dataset/y_train_values.csv')
            print(f"✅ Datos cargados: {X_train.shape[0]} muestras, {X_train.shape[1]} características")
        except Exception as e:
            print(f"❌ Error al cargar datos: {str(e)}")
            return False
        
        # Convertir y_train a array si es necesario
        y_true = y_train.values.ravel() if hasattr(y_train, 'values') else y_train
        
        # 3. Hacer predicciones
        try:
            # Predicción de probabilidades (para AUC-ROC)
            if hasattr(model, 'predict_proba'):
                y_proba = model.predict_proba(X_train)[:, 1]
            else:
                y_proba = model.predict(X_train)
                
            # Predicción de clases
            y_pred = model.predict(X_train)
            
            print("✅ Predicciones realizadas correctamente")
        except Exception as e:
            print(f"❌ Error en predicciones: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        # 4. Calcular métricas
        print("\n📊 MÉTRICAS DE RENDIMIENTO DEL MODELO:")
        print("=" * 50)
        
        # Precisión (Accuracy)
        acc = accuracy_score(y_true, y_pred)
        print(f"Precisión (Accuracy): {acc:.4f}")
        
        # AUC-ROC (Área bajo la curva ROC)
        try:
            auc = roc_auc_score(y_true, y_proba)
            print(f"AUC-ROC: {auc:.4f}")
        except:
            print("No se pudo calcular AUC-ROC")
        
        # F1-Score
        f1 = f1_score(y_true, y_pred)
        print(f"F1-Score: {f1:.4f}")
        
        # Precision y Recall
        prec = precision_score(y_true, y_pred)
        rec = recall_score(y_true, y_pred)
        print(f"Precision: {prec:.4f}")
        print(f"Recall: {rec:.4f}")
        
        # Matriz de confusión
        cm = confusion_matrix(y_true, y_pred)
        print("\nMatriz de Confusión:")
        print(cm)
        
        # 5. Interpretación de resultados
        print("\n📝 INTERPRETACIÓN:")
        
        if auc > 0.9:
            print("✅ Rendimiento EXCELENTE (AUC > 0.9)")
        elif auc > 0.8:
            print("✅ Rendimiento MUY BUENO (AUC > 0.8)")
        elif auc > 0.7:
            print("✅ Rendimiento BUENO (AUC > 0.7)")
        elif auc > 0.6:
            print("⚠️ Rendimiento ACEPTABLE (AUC > 0.6)")
        else:
            print("❌ Rendimiento BAJO (AUC ≤ 0.6)")
        
        # Advertencia sobre uso de datos de entrenamiento
        print("\n⚠️ NOTA: Esta evaluación se realizó con datos de entrenamiento.")
        print("Para una evaluación más precisa, use un conjunto de datos de prueba separado.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en la evaluación: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model_performance()
    if success:
        print("\nEvaluación completada exitosamente.")
    else:
        print("\nLa evaluación no fue exitosa. Revise los errores.")