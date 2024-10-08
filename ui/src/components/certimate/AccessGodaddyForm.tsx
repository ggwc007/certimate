import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { zodResolver } from "@hookform/resolvers/zod";

import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  Access,
  accessFormType,
  getUsageByConfigType,
  GodaddyConfig,
} from "@/domain/access";
import { save } from "@/repository/access";
import { useConfig } from "@/providers/config";
import { ClientResponseError } from "pocketbase";
import { PbErrorData } from "@/domain/base";

const AccessGodaddyFrom = ({
  data,
  onAfterReq,
}: {
  data?: Access;
  onAfterReq: () => void;
}) => {
  const { addAccess, updateAccess } = useConfig();
  const { t } = useTranslation();
  const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'access.form.name.not.empty').max(64, t('zod.rule.string.max', { max: 64 })),
    configType: accessFormType,
    apiKey: z.string().min(1, 'access.form.go.daddy.api.key.not.empty').max(64, t('zod.rule.string.max', { max: 64 })),
    apiSecret: z.string().min(1, 'access.form.go.daddy.api.secret.not.empty').max(64, t('zod.rule.string.max', { max: 64 })),
  });

  let config: GodaddyConfig = {
    apiKey: "",
    apiSecret: "",
  };
  if (data) config = data.config as GodaddyConfig;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || '',
      configType: "godaddy",
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    const req: Access = {
      id: data.id as string,
      name: data.name,
      configType: data.configType,
      usage: getUsageByConfigType(data.configType),
      config: {
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      },
    };

    try {
      const rs = await save(req);

      onAfterReq();

      req.id = rs.id;
      req.created = rs.created;
      req.updated = rs.updated;
      if (data.id) {
        updateAccess(req);
        return;
      }
      addAccess(req);
    } catch (e) {
      const err = e as ClientResponseError;

      Object.entries(err.response.data as PbErrorData).forEach(
        ([key, value]) => {
          form.setError(key as keyof z.infer<typeof formSchema>, {
            type: "manual",
            message: value.message,
          });
        }
      );
    }
  };

  return (
    <>
      <div className="max-w-[35em] mx-auto mt-10">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log(e);
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('access.form.name.not.empty')} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>{t('access.form.config.field')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="configType"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>{t('access.form.config.field')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('access.form.go.daddy.api.key')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('access.form.go.daddy.api.key.not.empty')} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('access.form.go.daddy.api.secret')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('access.form.go.daddy.api.secret.not.empty')} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default AccessGodaddyFrom;
