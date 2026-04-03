from ..models import ExcelData, GramPanchayat

def get_excel_records_for_gp(gp_id):
    """
    Helper to find all corresponding ExcelData records for a given GramPanchayat ID.
    Returns a QuerySet.
    """
    # 1. Try direct unique ID match
    qs = ExcelData.objects.filter(gp_unique=str(gp_id))
    
    # 2. Try with .0 suffix if not found
    if not qs.exists() and "." not in str(gp_id):
        qs = ExcelData.objects.filter(gp_unique=f"{gp_id}.0")
    
    # 3. Try Robust Mapping (Name + Block)
    if not qs.exists():
        try:
            gp = GramPanchayat.objects.get(id=gp_id)
            target_gp_name = str(gp.name).strip().upper()
            target_block_name = str(gp.block.name).strip().upper()
            
            # 3a. Exact match with Block (Best)
            from django.db.models import Q
            qs = ExcelData.objects.filter(
                Q(uni_block__iexact=target_block_name) | Q(block_2020__iexact=target_block_name),
                gp_final__iexact=target_gp_name
            )
            
            if not qs.exists():
                # 3b. Try matching by GP name only
                qs = ExcelData.objects.filter(gp_final__iexact=target_gp_name)
                
            if not qs.exists():
                # 3c. Try partial name matching
                qs = ExcelData.objects.filter(gp_final__icontains=target_gp_name)
                
            if not qs.exists():
                # 3d. Fallback to block baseline
                qs = ExcelData.objects.filter(uni_block__icontains=target_block_name)
                
        except Exception as e:
            print(f"DEBUG: Mapping failed for gp_id {gp_id}: {e}")
            
    return qs

def get_excel_data_for_gp(gp_id):
    """Legacy helper returning first matching record"""
    return get_excel_records_for_gp(gp_id).first()
