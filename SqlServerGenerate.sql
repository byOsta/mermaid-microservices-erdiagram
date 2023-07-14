SET NOCOUNT ON;

SELECT 'erDiagram'
UNION ALL
SELECT 
    '    ' + c.TABLE_NAME + ' {' +
    (
        SELECT CHAR(10) + '    ' + '    ' + DATA_TYPE  + IIF(DATA_TYPE = 'nvarchar', IIF(CHARACTER_MAXIMUM_LENGTH IS NULL,  '', IIF(CHARACTER_MAXIMUM_LENGTH = -1, '(MAX)', '('  + CONVERT(varchar(20), CHARACTER_MAXIMUM_LENGTH)  + ')') ), '') + ' ' +  COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = c.TABLE_SCHEMA
            AND TABLE_NAME = c.TABLE_NAME
            AND COLUMN_NAME NOT LIKE 'Period%'
        ORDER BY ORDINAL_POSITION
        FOR XML PATH('')
    ) +
    CHAR(10) + '    ' + '}' + CHAR(10) 
FROM INFORMATION_SCHEMA.TABLES c
WHERE c.TABLE_TYPE IN ('BASE TABLE', 'VIEW')
    AND NOT EXISTS (
        SELECT 1
        FROM sys.partition_schemes ps
        JOIN sys.indexes i ON i.data_space_id = ps.data_space_id
        WHERE i.object_id = OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME)
    )
    AND c.TABLE_SCHEMA NOT LIKE 'pg_%'
    AND c.TABLE_SCHEMA <> 'information_schema'
	-- AND c.TABLE_NAME NOT LIKE '%History' --TODO Remove if needed.
	AND c.TABLE_NAME NOT LIKE 'sysdiagrams' --TODO Remove if needed.
UNION ALL
SELECT 
    -- '    ' + c1.name + ' }|--|| ' + c2.name + ' : "has"'
    '    ' + c2.name + ' ||--|{ ' + c1.name + ' : ""'
FROM sys.foreign_keys f
JOIN sys.tables c1 ON f.parent_object_id = c1.object_id
JOIN sys.tables c2 ON f.referenced_object_id = c2.object_id;
