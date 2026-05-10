import json

MDJ_PATH = r"c:\Users\User\Documents\1-2026\c\proyecto-si1-grulac\DIAGRAMAS\diagramaClases.mdj"

with open(MDJ_PATH, "r", encoding="utf-8") as f:
    project = json.load(f)

model = project["ownedElements"][0]
elements = model["ownedElements"]

classes = [e for e in elements if e.get("_type") == "UMLClass"]
diagram = [e for e in elements if e.get("_type") == "UMLClassDiagram"][0]
views = diagram["ownedViews"]

print(f"Total classes: {len(classes)}")
print(f"Total diagram views: {len(views)}")
print("")

for c in classes:
    name = c["name"]
    attrs = c.get("attributes", [])
    ops = c.get("operations", [])
    attr_names = [a["name"] for a in attrs]
    op_names = [o["name"] for o in ops]
    
    # Check if view exists
    cid = c["_id"]
    cv = None
    for v in views:
        if v.get("_type") == "UMLClassView" and v.get("model", {}).get("$ref") == cid:
            cv = v
            break
    
    view_ok = "OK" if cv else "MISSING"
    attr_view_count = 0
    op_view_count = 0
    if cv:
        for sv in cv.get("subViews", []):
            if sv.get("_type") == "UMLAttributeCompartmentView":
                attr_view_count = len(sv.get("subViews", []))
            if sv.get("_type") == "UMLOperationCompartmentView":
                op_view_count = len(sv.get("subViews", []))
    
    status = "OK" if (len(attrs) == attr_view_count and len(ops) == op_view_count) else "MISMATCH"
    print(f"  {name:<30} attrs={len(attrs):>2}  ops={len(ops)}  view={view_ok}  attrViews={attr_view_count:>2}  opViews={op_view_count}  [{status}]")

print("")
print("--- Sample: RECEPCIONES_LECHE attributes ---")
for c in classes:
    if c["name"] == "RECEPCIONES_LECHE":
        for a in c.get("attributes", []):
            t = a.get("type", "")
            print(f"  - {a['name']}: {t}")
        print("  Operations:")
        for o in c.get("operations", []):
            print(f"  + {o['name']}")

# Validate JSON structure integrity
print("\n--- Validation ---")
try:
    json_str = json.dumps(project)
    re_parsed = json.loads(json_str)
    print("JSON integrity: VALID")
except Exception as e:
    print(f"JSON integrity: INVALID - {e}")
