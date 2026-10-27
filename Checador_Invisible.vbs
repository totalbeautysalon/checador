Set objShell = WScript.CreateObject("WScript.Shell")
' Obtener la ruta de la carpeta actual
strPath = Wscript.ScriptFullName
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objFile = objFSO.GetFile(strPath)
strFolder = objFSO.GetParentFolderName(objFile) 

' Ejecutar el archivo .bat de forma oculta (0)
objShell.Run chr(34) & strFolder & "\Arrancar_Checador.bat" & Chr(34), 0
Set objShell = Nothing
