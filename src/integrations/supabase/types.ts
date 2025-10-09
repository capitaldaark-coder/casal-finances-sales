export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          criado_em: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          saldo_devedor: number | null
          telefone: string | null
        }
        Insert: {
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          saldo_devedor?: number | null
          telefone?: string | null
        }
        Update: {
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          saldo_devedor?: number | null
          telefone?: string | null
        }
        Relationships: []
      }
      contas_a_pagar: {
        Row: {
          criado_em: string | null
          data_emissao: string | null
          descricao: string
          fornecedor_id: string | null
          id: string
          numero_parcelas: number | null
          valor_total: number
        }
        Insert: {
          criado_em?: string | null
          data_emissao?: string | null
          descricao: string
          fornecedor_id?: string | null
          id?: string
          numero_parcelas?: number | null
          valor_total: number
        }
        Update: {
          criado_em?: string | null
          data_emissao?: string | null
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          numero_parcelas?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          criado_em: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      itens_venda: {
        Row: {
          criado_em: string | null
          id: string
          preco_custo: number | null
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          subtotal: number
          venda_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          preco_custo?: number | null
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
          subtotal: number
          venda_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          preco_custo?: number | null
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          conteudo: string
          criado_em: string | null
          id: string
          titulo: string | null
        }
        Insert: {
          conteudo: string
          criado_em?: string | null
          id?: string
          titulo?: string | null
        }
        Update: {
          conteudo?: string
          criado_em?: string | null
          id?: string
          titulo?: string | null
        }
        Relationships: []
      }
      pagamentos_clientes: {
        Row: {
          cliente_id: string | null
          data_pagamento: string | null
          id: string
          observacao: string | null
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          data_pagamento?: string | null
          id?: string
          observacao?: string | null
          valor: number
        }
        Update: {
          cliente_id?: string | null
          data_pagamento?: string | null
          id?: string
          observacao?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_contas: {
        Row: {
          conta_id: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: string
          numero_parcela: number
          status: string | null
          valor_parcela: number
        }
        Insert: {
          conta_id?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          numero_parcela: number
          status?: string | null
          valor_parcela: number
        }
        Update: {
          conta_id?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          numero_parcela?: number
          status?: string | null
          valor_parcela?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_contas_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_a_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          codigo_barras: string | null
          criado_em: string | null
          estoque_minimo: number | null
          id: string
          nome: string
          preco_custo: number | null
          preco_venda: number
          quantidade_estoque: number | null
        }
        Insert: {
          codigo_barras?: string | null
          criado_em?: string | null
          estoque_minimo?: number | null
          id?: string
          nome: string
          preco_custo?: number | null
          preco_venda: number
          quantidade_estoque?: number | null
        }
        Update: {
          codigo_barras?: string | null
          criado_em?: string | null
          estoque_minimo?: number | null
          id?: string
          nome?: string
          preco_custo?: number | null
          preco_venda?: number
          quantidade_estoque?: number | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: string | null
          data_venda: string | null
          forma_pagamento: string | null
          id: string
          lucro_total: number | null
          numero_parcelas: number | null
          status: string | null
          troco: number | null
          valor_recebido: number | null
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          data_venda?: string | null
          forma_pagamento?: string | null
          id?: string
          lucro_total?: number | null
          numero_parcelas?: number | null
          status?: string | null
          troco?: number | null
          valor_recebido?: number | null
          valor_total: number
        }
        Update: {
          cliente_id?: string | null
          data_venda?: string | null
          forma_pagamento?: string | null
          id?: string
          lucro_total?: number | null
          numero_parcelas?: number | null
          status?: string | null
          troco?: number | null
          valor_recebido?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_parcelas_vencidas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
