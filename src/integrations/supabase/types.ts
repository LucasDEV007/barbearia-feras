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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          beneficio_aplicado: boolean
          created_at: string | null
          data: string
          estilo: string | null
          horario: string
          id: string
          nome_cliente: string
          servico: string
          status: string
          telefone: string
        }
        Insert: {
          beneficio_aplicado?: boolean
          created_at?: string | null
          data: string
          estilo?: string | null
          horario: string
          id?: string
          nome_cliente: string
          servico: string
          status?: string
          telefone: string
        }
        Update: {
          beneficio_aplicado?: boolean
          created_at?: string | null
          data?: string
          estilo?: string | null
          horario?: string
          id?: string
          nome_cliente?: string
          servico?: string
          status?: string
          telefone?: string
        }
        Relationships: []
      }
      bloqueios_agenda: {
        Row: {
          created_at: string
          data: string
          horario: string | null
          id: string
          motivo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          horario?: string | null
          id?: string
          motivo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          horario?: string | null
          id?: string
          motivo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cortes_recentes: {
        Row: {
          created_at: string
          descricao: string | null
          estilo: string | null
          id: string
          imagem_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          estilo?: string | null
          id?: string
          imagem_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          estilo?: string | null
          id?: string
          imagem_url?: string
          user_id?: string
        }
        Relationships: []
      }
      cortes_recentes_config: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          limite: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          limite?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          limite?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          pago: boolean
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria?: string
          created_at?: string | null
          descricao: string
          id?: string
          pago?: boolean
          user_id: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          pago?: boolean
          user_id?: string
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      fidelidade_config: {
        Row: {
          ativo: boolean
          beneficio: string
          cortes_necessarios: number
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          beneficio?: string
          cortes_necessarios?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          beneficio?: string
          cortes_necessarios?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fidelidade_pontos: {
        Row: {
          created_at: string | null
          id: string
          nome_cliente: string
          pontos: number
          recompensa_disponivel: boolean
          recompensas_utilizadas: number
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome_cliente: string
          pontos?: number
          recompensa_disponivel?: boolean
          recompensas_utilizadas?: number
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome_cliente?: string
          pontos?: number
          recompensa_disponivel?: boolean
          recompensas_utilizadas?: number
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mensagem_templates: {
        Row: {
          ativo: boolean
          conteudo: string
          created_at: string | null
          id: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          conteudo: string
          created_at?: string | null
          id?: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          conteudo?: string
          created_at?: string | null
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      mensagens_enviadas: {
        Row: {
          agendamento_id: string
          enviado_em: string | null
          id: string
          tipo: string
        }
        Insert: {
          agendamento_id: string
          enviado_em?: string | null
          id?: string
          tipo: string
        }
        Update: {
          agendamento_id?: string
          enviado_em?: string | null
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_enviadas_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
